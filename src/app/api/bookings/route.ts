import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11 && clean.startsWith('569')) {
    return clean;
  }
  if (clean.length === 9 && clean.startsWith('9')) {
    return `56${clean}`;
  }
  if (clean.length === 8) {
    return `569${clean}`;
  }
  return clean;
};

const parseDurationToMinutes = (duration: any): number => {
  if (!duration) return 60;
  if (typeof duration === 'number') return duration;
  const clean = String(duration).toLowerCase().trim();
  let totalMinutes = 0;
  
  const hourMatch = clean.match(/(\d+)\s*(?:hrs|hr|hora|horas)/);
  if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
  
  const minMatch = clean.match(/(\d+)\s*(?:min|mins|minutos)/);
  if (minMatch) totalMinutes += parseInt(minMatch[1], 10);
  
  if (totalMinutes === 0) {
    const fallbackMatch = clean.match(/(\d+)/);
    if (fallbackMatch) {
      totalMinutes = parseInt(fallbackMatch[1], 10);
      if (totalMinutes < 5) totalMinutes *= 60;
    }
  }
  return totalMinutes > 0 ? totalMinutes : 60;
};

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const clean = timeStr.substring(0, 5);
  const [hours, minutes] = clean.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

const cleanText = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clientName,
      clientPhone,
      clientEmail,
      category,
      serviceName,
      price,
      specialistId,
      specialistName,
      date,
      time,
      channel,
      status,
      giftCardUsed,
      abonoTransferido,
      abonoConfirmado,
      forceBooking
    } = body;

    if (!clientName || !clientPhone || !serviceName || !date || !time) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios para completar la reserva.' },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Error de configuración en el servidor (Supabase Keys).' },
        { status: 500 }
      );
    }

    // Cliente con Service Role Key para tener visión completa y saltar RLS
    const supabase = createClient(url, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // 1. Obtener lista de servicios y especialistas para calcular duración y nombres
    const [servicesRes, specialistsRes] = await Promise.all([
      supabase.from('services').select('id, name, duration, category'),
      supabase.from('specialists').select('id, name')
    ]);

    const allServices = servicesRes.data || [];
    const allSpecialists = specialistsRes.data || [];

    // Resolver specialist_id si solo viene el nombre, o viceversa
    let resolvedSpecialistId = specialistId || null;
    let resolvedSpecialistName = specialistName || '';

    if (!resolvedSpecialistId && resolvedSpecialistName) {
      const match = allSpecialists.find(
        (s: any) => cleanText(s.name) === cleanText(resolvedSpecialistName)
      );
      if (match) {
        resolvedSpecialistId = match.id;
      }
    } else if (resolvedSpecialistId && !resolvedSpecialistName) {
      const match = allSpecialists.find((s: any) => s.id === resolvedSpecialistId);
      if (match) {
        resolvedSpecialistName = match.name;
      }
    }

    // 2. Calcular duración del nuevo servicio
    const calculateDuration = (sName: string): number => {
      if (!sName) return 60;
      if (sName.includes(' + ')) {
        const parts = sName.split(' + ');
        let total = 0;
        for (const part of parts) {
          const found = allServices.find((s: any) => cleanText(s.name) === cleanText(part));
          if (found) {
            total += parseDurationToMinutes(found.duration);
          } else {
            total += 30;
          }
        }
        return total > 0 ? total : 60;
      }
      const found = allServices.find((s: any) => cleanText(s.name) === cleanText(sName));
      return found ? parseDurationToMinutes(found.duration) : 60;
    };

    const newDuration = calculateDuration(serviceName);
    const newSlotStart = timeToMinutes(time);
    const newSlotEnd = newSlotStart + newDuration;

    // 3. Validación de traslapes en servidor (a menos que forceBooking sea true)
    if (!forceBooking) {
      // 3.1 Consultar reservas existentes en la fecha
      const { data: existingBookings, error: bQueryErr } = await supabase
        .from('bookings')
        .select('id, specialist_id, specialist_name, date, time, service_name, status')
        .eq('date', date)
        .neq('status', 'cancelado')
        .neq('status', 'no_llego');

      if (bQueryErr) throw bQueryErr;

      const targetSpecNameClean = cleanText(resolvedSpecialistName);

      for (const b of existingBookings || []) {
        const bSpecId = b.specialist_id;
        const bSpecNameClean = cleanText(b.specialist_name);

        const isSameSpecialist =
          (resolvedSpecialistId && bSpecId && resolvedSpecialistId === bSpecId) ||
          (targetSpecNameClean && bSpecNameClean && targetSpecNameClean === bSpecNameClean) ||
          bSpecNameClean === 'todos' ||
          bSpecNameClean === 'all' ||
          bSpecNameClean === 'sin asignar' ||
          bSpecNameClean === 'cualquiera';

        if (isSameSpecialist) {
          const bookingStart = timeToMinutes(b.time);
          const bookingDuration = calculateDuration(b.service_name);
          const bookingEnd = bookingStart + bookingDuration;

          // Condición estricta de traslape
          if (newSlotStart < bookingEnd && newSlotEnd > bookingStart) {
            const conflictTimeStart = b.time;
            const conflictTimeEnd = `${String(Math.floor(bookingEnd / 60)).padStart(2, '0')}:${String(bookingEnd % 60).padStart(2, '0')}`;
            return NextResponse.json(
              {
                error: `El horario de las ${time} hrs para ${resolvedSpecialistName || 'este profesional'} ya no está disponible (coincide con una cita de ${conflictTimeStart} a ${conflictTimeEnd} hrs). Por favor, selecciona otro horario libre.`
              },
              { status: 409 }
            );
          }
        }
      }

      // 3.2 Consultar bloqueos de horario administrativos (time_blocks)
      let tbQuery = supabase
        .from('time_blocks')
        .select('id, start_time, end_time, reason, specialist_id')
        .eq('date', date);

      if (resolvedSpecialistId) {
        tbQuery = tbQuery.or(`specialist_id.eq.${resolvedSpecialistId},specialist_id.eq.todos,specialist_id.eq.all,specialist_id.is.null`);
      }

      const { data: timeBlocks, error: tbErr } = await tbQuery;
      if (tbErr) throw tbErr;

      for (const tb of timeBlocks || []) {
        const tbStart = timeToMinutes(tb.start_time);
        const tbEnd = timeToMinutes(tb.end_time);

        if (newSlotStart < tbEnd && newSlotEnd > tbStart) {
          return NextResponse.json(
            {
              error: `El horario de las ${time} hrs se encuentra bloqueado por administración (${tb.reason || 'Bloqueo'}: ${tb.start_time.substring(0, 5)} - ${tb.end_time.substring(0, 5)} hrs).`
            },
            { status: 409 }
          );
        }
      }
    }

    // 4. Preparar datos finales para inserción
    const prefix =
      category === 'barberia' ? 'BAR' :
      category === 'peluqueria' ? 'PEL' :
      category === 'terapias' ? 'TER' : 'VAL';
    const randomCode = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalChannel = channel || 'Web';
    const finalStatus = status || ((category === 'peluqueria' || category === 'terapias') ? 'pendiente' : 'confirmado');
    const normalizedClientPhone = normalizePhone(clientPhone) || clientPhone;
    const bookingPriceNumber = typeof price === 'number'
      ? price
      : parseInt(String(price).replace(/[^0-9]/g, ''), 10) || 0;
    const createdAt = new Date().toISOString();

    // 5. Crear o actualizar Cliente en CRM (clients)
    try {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', normalizedClientPhone)
        .maybeSingle();

      if (existingClient) {
        const businessesSet = new Set(existingClient.businesses || []);
        if (category) businessesSet.add(category);

        await supabase
          .from('clients')
          .update({
            name: clientName,
            email: clientEmail || existingClient.email || '',
            businesses: Array.from(businessesSet),
            total_spent: (existingClient.total_spent || 0) + bookingPriceNumber,
            last_visit: date
          })
          .eq('phone', normalizedClientPhone);
      } else {
        await supabase.from('clients').insert({
          phone: normalizedClientPhone,
          name: clientName,
          email: clientEmail || '',
          businesses: category ? [category] : [],
          total_spent: bookingPriceNumber,
          last_visit: date,
          notes: '',
          not_so_good_client: false
        });
      }
    } catch (crmErr) {
      console.warn('[API /api/bookings] Advertencia al sincronizar cliente CRM:', crmErr);
    }

    // 6. Insertar Reserva en bookings
    const { error: insertErr } = await supabase.from('bookings').insert({
      id: randomCode,
      client_phone: normalizedClientPhone,
      category: category || 'barberia',
      service_name: serviceName,
      price: bookingPriceNumber,
      specialist_id: resolvedSpecialistId,
      specialist_name: resolvedSpecialistName || 'Sin Asignar',
      date,
      time,
      channel: finalChannel,
      status: finalStatus,
      created_at: createdAt,
      gift_card_used: giftCardUsed || null,
      abono_transferido: abonoTransferido || false,
      abono_confirmado: abonoConfirmado || false
    });

    if (insertErr) {
      console.error('[API /api/bookings] Error al insertar reserva:', insertErr);
      return NextResponse.json(
        { error: 'Error al registrar la reserva en la base de datos: ' + insertErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: randomCode,
      booking: {
        id: randomCode,
        clientName,
        clientPhone: normalizedClientPhone,
        clientEmail: clientEmail || '',
        category,
        serviceName,
        price: typeof price === 'number' ? `$${price.toLocaleString('es-CL')}` : price,
        specialistId: resolvedSpecialistId,
        specialistName: resolvedSpecialistName,
        date,
        time,
        channel: finalChannel,
        status: finalStatus,
        createdAt,
        giftCardUsed,
        abonoTransferido,
        abonoConfirmado
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('[API /api/bookings] Error no controlado:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor al procesar la reserva.' },
      { status: 500 }
    );
  }
}
