import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import { useServicesStore } from './useServicesStore';

export const normalizePhone = (phone: string): string => {
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

const parseDurationToMinutes = (durationStr: string): number => {
  if (!durationStr) return 60;
  const clean = durationStr.toLowerCase().trim();
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
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  category: 'barberia' | 'peluqueria' | 'terapias';
  serviceName: string;
  price: string;
  specialistName: string;
  date: string;
  time: string;
  channel: 'Web' | 'WhatsApp' | 'Presencial' | 'Instagram';
  status: 'confirmado' | 'pendiente' | 'en_proceso' | 'completado' | 'bloqueado' | 'cancelado' | 'no_llego';
  createdAt: string;
  giftCardUsed?: string;
  abonoTransferido?: boolean;
  abonoConfirmado?: boolean;
  metodoPago?: 'efectivo' | 'transferencia' | 'tarjeta' | '';
}

export interface ClientProfile {
  name: string;
  phone: string;
  email: string;
  businesses: ('barberia' | 'peluqueria' | 'terapias')[];
  totalSpent: number;
  lastVisit: string;
  notes: string;
  notSoGoodClient?: boolean;
  cancellationsCount?: number;
  noShowsCount?: number;
}

interface BookingStore {
  bookings: Booking[];
  clients: ClientProfile[];
  loading: boolean;
  
  // Actions
  fetchBookingsAndClients: () => Promise<void>;
  fetchPublicBookings: () => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'channel' | 'status'> & Partial<Pick<Booking, 'channel' | 'status'>>) => Promise<string>;
  updateBookingStatus: (id: string, status: Booking['status'], metodoPago?: Booking['metodoPago'], serviceName?: string, price?: string) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  updateClientNotes: (phone: string, notes: string) => Promise<void>;
  markAsNotGoodClient: (phone: string) => Promise<void>;
  deleteClient: (phone: string) => Promise<void>;
  updateClient: (oldPhone: string, updatedFields: { name: string; phone: string; email: string }) => Promise<void>;
  incrementClientCancellations: (phone: string) => Promise<void>;
  incrementClientNoShows: (phone: string) => Promise<void>;
  markDepositAsTransferred: (id: string) => Promise<void>;
  confirmDeposit: (id: string) => Promise<void>;
  updateBookingDetails: (id: string, oldPhone: string, fields: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    category: 'barberia' | 'peluqueria' | 'terapias';
    serviceName: string;
    price: string;
    specialistName: string;
    date: string;
    time: string;
    status: Booking['status'];
  }) => Promise<void>;
}

const supabase = createClient();
let publicBookingsRealtimeChannel: any = null;

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  clients: [],
  loading: false,

  fetchBookingsAndClients: async () => {
    const hasData = get().bookings.length > 0;
    if (!hasData) {
      set({ loading: true });
    }
    try {
      const { data: dbBookings, error: bErr } = await supabase
        .from('admin_bookings')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (bErr) throw bErr;

      const { data: dbClients, error: cErr } = await supabase
        .from('clients')
        .select('phone, name, email, businesses, total_spent, last_visit, notes, not_so_good_client');

      if (cErr) throw cErr;

      const bookings: Booking[] = (dbBookings || []).map((b: any) => ({
        id: b.id,
        clientName: b.client_name,
        clientPhone: b.client_phone,
        clientEmail: b.client_email || '',
        category: b.category,
        serviceName: b.service_name,
        price: typeof b.price === 'number' ? `$${b.price.toLocaleString('es-CL')}` : b.price,
        specialistName: b.specialist_name,
        date: b.date,
        time: b.time,
        channel: b.channel,
        status: b.status,
        createdAt: b.created_at,
        giftCardUsed: b.gift_card_used,
        abonoTransferido: b.abono_transferido || false,
        abonoConfirmado: b.abono_confirmado || false,
        metodoPago: b.metodo_pago || ''
      }));

      const clients: ClientProfile[] = (dbClients || []).map((c: any) => {
        let cancellationsCount = c.cancellations_count || 0;
        let noShowsCount = c.no_shows_count || 0;
        
        // Parse fallback from notes if columns are missing/0
        const notesStr = c.notes || '';
        if (!c.cancellations_count) {
          const cancelMatch = notesStr.match(/\[Cancelaciones:\s*(\d+)\]/);
          if (cancelMatch) cancellationsCount = parseInt(cancelMatch[1], 10);
        }
        if (!c.no_shows_count) {
          const noShowMatch = notesStr.match(/\[Inasistencias:\s*(\d+)\]/);
          if (noShowMatch) noShowsCount = parseInt(noShowMatch[1], 10);
        }

        return {
          name: c.name,
          phone: c.phone,
          email: c.email || '',
          businesses: c.businesses || [],
          totalSpent: c.total_spent || 0,
          lastVisit: c.last_visit || '',
          notes: c.notes || '',
          notSoGoodClient: c.not_so_good_client || false,
          cancellationsCount,
          noShowsCount
        };
      });

      set({ bookings, clients, loading: false });
    } catch (error) {
      console.error('Error fetching bookings/clients:', error);
      set({ loading: false });
    }
  },
  
  fetchPublicBookings: async () => {
    set({ loading: true });
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 30);
      const maxDateStr = maxDate.toISOString().split('T')[0];

      // Consultar la vista 'public_bookings' para obtener reservas y bloqueos anónimos
      const { data: dbBookings, error: bErr } = await supabase
        .from('public_bookings')
        .select('id, specialist_name, date, time, service_name, status')
        .gte('date', todayStr)
        .lte('date', maxDateStr);

      if (bErr) throw bErr;

      const bookings: Booking[] = (dbBookings || []).map((b: any) => ({
        id: b.id,
        clientName: b.status === 'bloqueado' ? 'Bloqueado' : 'Reservado',
        clientPhone: '',
        clientEmail: '',
        category: 'barberia', // dummy
        serviceName: b.service_name,
        price: '',
        specialistName: b.specialist_name,
        date: b.date,
        time: b.time,
        channel: 'Web',
        status: b.status,
        createdAt: '',
        giftCardUsed: ''
      }));

      // Suscribir a cambios en tiempo real de la tabla bookings
      if (!publicBookingsRealtimeChannel) {
        publicBookingsRealtimeChannel = supabase
          .channel('public:public_bookings_realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
            get().fetchPublicBookings();
          })
          .subscribe();
      }

      set({ bookings, clients: [], loading: false });
    } catch (error) {
      console.error('Error fetching public bookings:', error);
      set({ loading: false });
    }
  },

  addBooking: async (bookingData) => {
    const prefix = 
      bookingData.category === 'barberia' ? 'BAR' :
      bookingData.category === 'peluqueria' ? 'PEL' :
      bookingData.category === 'terapias' ? 'TER' : 'VAL';
    const randomCode = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    const channel = bookingData.channel || (Math.random() > 0.4 ? 'Web' : 'WhatsApp');
    const status = bookingData.status || 'confirmado';
    const createdAt = new Date().toISOString();

    const bookingPrice = typeof bookingData.price === 'number'
      ? bookingData.price
      : parseInt(bookingData.price.replace(/[^0-9]/g, ''), 10) || 0;

    try {
      // 0. Verificar traslapes de último segundo con reservas existentes y bloques de horario administrativos (Prevención de Doble Reserva / Race Condition)
      const allSpecs = useServicesStore.getState().specialistsList || [];
      const targetSpec = allSpecs.find(s => s.name.trim().toLowerCase() === bookingData.specialistName.trim().toLowerCase());
      const targetSpecId = targetSpec ? targetSpec.id : null;

      // 0.1 Verificar traslapes con bloques de horario administrativos (time_blocks)
      let blocksQuery = supabase
        .from('time_blocks')
        .select('id, start_time, end_time, reason, specialist_id')
        .eq('date', bookingData.date);

      if (targetSpecId) {
        blocksQuery = blocksQuery.eq('specialist_id', targetSpecId);
      }

      const { data: conflictingBlocks, error: blocksErr } = await blocksQuery;
      if (blocksErr) throw blocksErr;

      let allServices = Object.keys(useServicesStore.getState().servicesData).flatMap(
        cat => useServicesStore.getState().servicesData[cat].services
      );

      if (allServices.length === 0) {
        const { data: dbServices } = await supabase.from('services').select('*');
        if (dbServices) {
          allServices = dbServices.map((s: any) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            duration: s.duration,
            category: s.category
          }));
        }
      }

      const newService = allServices.find(s => s.name.trim().toLowerCase() === bookingData.serviceName.trim().toLowerCase());
      const newServiceDuration = newService 
        ? (typeof newService.duration === 'number' ? newService.duration : parseDurationToMinutes(newService.duration)) 
        : 60;
      const slotStart = timeToMinutes(bookingData.time);
      const slotEnd = slotStart + newServiceDuration;

      if (conflictingBlocks && conflictingBlocks.length > 0) {
        for (const block of conflictingBlocks) {
          const blockStartStr = block.start_time.substring(0, 5);
          const blockEndStr = block.end_time.substring(0, 5);
          const blockStart = timeToMinutes(blockStartStr);
          const blockEnd = timeToMinutes(blockEndStr);

          if (slotStart < blockEnd && slotEnd > blockStart) {
            throw new Error(`El horario de las ${bookingData.time} hrs para ${bookingData.specialistName} se encuentra bloqueado por administración (${block.reason}: ${blockStartStr} - ${blockEndStr}). Por favor, selecciona otro horario.`);
          }
        }
      }

      // 0.2 Verificar traslapes con reservas de clientes existentes (bookings)
      const { data: conflictingBookings, error: checkErr } = await supabase
        .from('bookings')
        .select('id, time, service_name, status')
        .eq('date', bookingData.date)
        .eq('specialist_name', bookingData.specialistName)
        .neq('status', 'cancelado')
        .neq('status', 'no_llego');

      if (checkErr) throw checkErr;

      if (conflictingBookings && conflictingBookings.length > 0) {
        for (const existing of conflictingBookings) {
          const existingStart = timeToMinutes(existing.time);
          const existingService = allServices.find(s => s.name.trim().toLowerCase() === existing.service_name.trim().toLowerCase());
          const existingDuration = existingService 
            ? (typeof existingService.duration === 'number' ? existingService.duration : parseDurationToMinutes(existingService.duration)) 
            : 60;
          const existingEnd = existingStart + existingDuration;

          if (slotStart < existingEnd && slotEnd > existingStart) {
            throw new Error(`El horario de las ${bookingData.time} hrs para ${bookingData.specialistName} acaba de ser reservado. Por favor, selecciona otro bloque.`);
          }
        }
      }

      const normalizedPhone = normalizePhone(bookingData.clientPhone) || bookingData.clientPhone;

      // 1. Fetch or update CRM Client details in Supabase (Required first due to foreign key constraint)
      try {
        const { data: existingClient, error: cFetchErr } = await supabase
          .from('clients')
          .select('*')
          .eq('phone', normalizedPhone)
          .maybeSingle();

        if (cFetchErr) throw cFetchErr;

        if (existingClient) {
          // Merge businesses array
          const businessesSet = new Set(existingClient.businesses || []);
          businessesSet.add(bookingData.category);
          const updatedBusinesses = Array.from(businessesSet);

          const { error: cUpdateErr } = await supabase
            .from('clients')
            .update({
              name: bookingData.clientName,
              email: bookingData.clientEmail || existingClient.email || '',
              businesses: updatedBusinesses,
              total_spent: (existingClient.total_spent || 0) + bookingPrice,
              last_visit: bookingData.date
            })
            .eq('phone', normalizedPhone);

          if (cUpdateErr) throw cUpdateErr;
        } else {
          const { error: cInsertErr } = await supabase.from('clients').insert({
            phone: normalizedPhone,
            name: bookingData.clientName,
            email: bookingData.clientEmail || '',
            businesses: [bookingData.category],
            total_spent: bookingPrice,
            last_visit: bookingData.date,
            notes: '',
            not_so_good_client: false
          });

          if (cInsertErr) {
            // Handle RLS invisible client duplicate key error (code 23505)
            if (cInsertErr.code === '23505') {
              console.log('Client already exists in database (hidden by RLS), ignoring insert duplicate error.');
            } else {
              throw cInsertErr;
            }
          }
        }
      } catch (clientErr) {
        console.error('CRM Client sync error:', clientErr);
        throw new Error('Error al registrar o actualizar los datos del cliente.');
      }

      // 2. Insert Booking in Supabase (Omit client_name and client_email as they are dropped from raw table)
      const { error: bErr } = await supabase.from('bookings').insert({
        id: randomCode,
        client_phone: normalizedPhone,
        category: bookingData.category,
        service_name: bookingData.serviceName,
        price: bookingPrice,
        specialist_name: bookingData.specialistName,
        date: bookingData.date,
        time: bookingData.time,
        channel,
        status,
        created_at: createdAt,
        gift_card_used: bookingData.giftCardUsed || null,
        abono_transferido: (bookingData as any).abonoTransferido || false,
        abono_confirmado: (bookingData as any).abonoConfirmado || false
      });

      if (bErr) throw bErr;

      // 3. Update local state
      const newBooking: Booking = {
        ...bookingData,
        clientPhone: normalizedPhone,
        id: randomCode,
        clientEmail: bookingData.clientEmail || '',
        channel,
        status,
        createdAt,
        abonoTransferido: (bookingData as any).abonoTransferido || false,
        abonoConfirmado: (bookingData as any).abonoConfirmado || false
      };

      set((state) => {
        const updatedBookings = [newBooking, ...state.bookings];
        const existingIdx = state.clients.findIndex(c => c.phone === normalizedPhone);
        let updatedClients = [...state.clients];

        if (existingIdx !== -1) {
          const client = updatedClients[existingIdx];
          const newBusinesses = Array.from(new Set([...client.businesses, bookingData.category]));
          updatedClients[existingIdx] = {
            ...client,
            name: bookingData.clientName,
            email: bookingData.clientEmail || client.email,
            businesses: newBusinesses,
            totalSpent: client.totalSpent + bookingPrice,
            lastVisit: bookingData.date
          };
        } else {
          updatedClients.push({
            name: bookingData.clientName,
            phone: normalizedPhone,
            email: bookingData.clientEmail || '',
            businesses: [bookingData.category],
            totalSpent: bookingPrice,
            lastVisit: bookingData.date,
            notes: ''
          });
        }

        return {
          bookings: updatedBookings,
          clients: updatedClients
        };
      });

      // Disparar correo de confirmación de reserva (Cliente + Staff/Admin)
      try {
        const allSpecs = useServicesStore.getState().specialistsList || [];
        const spec = allSpecs.find(s => s.name.trim().toLowerCase() === bookingData.specialistName.trim().toLowerCase());
        const specialistEmail = spec ? spec.email : '';

        fetch('/api/email', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            type: 'booking_confirmation',
            data: {
              ...newBooking,
              specialistEmail
            }
          })
        }).catch(err => console.error('Error enviando mail de confirmacion:', err));
      } catch (emailErr) {
        console.error('Error al resolver mail del especialista o disparar email:', emailErr);
      }

    } catch (err) {
      console.error('Error adding booking:', err);
      throw err;
    }

    return randomCode;
  },

  updateBookingStatus: async (id, status, metodoPago?: Booking['metodoPago'], serviceName?: string, price?: string) => {
    try {
      const updateData: any = { status };
      if (status === 'completado' && metodoPago) {
        updateData.metodo_pago = metodoPago;
      }
      if (serviceName) {
        updateData.service_name = serviceName;
      }
      if (price) {
        const numericPrice = typeof price === 'number' ? price : parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
        updateData.price = numericPrice;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        bookings: state.bookings.map(b => b.id === id ? { 
          ...b, 
          status, 
          metodoPago: metodoPago || b.metodoPago,
          ...(serviceName ? { serviceName } : {}),
          ...(price ? { price } : {})
        } : b)
      }));
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  },

  deleteBooking: async (id) => {
    try {
      // Obtener detalles de la reserva antes de eliminarla para enviar correo de cancelación
      const { data: bookingToCancel } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        bookings: state.bookings.filter(b => b.id !== id)
      }));

      // Disparar correo de cancelación si la reserva existía
      if (bookingToCancel) {
        try {
          const allSpecs = useServicesStore.getState().specialistsList || [];
          const spec = allSpecs.find(s => s.name.trim().toLowerCase() === bookingToCancel.specialist_name.trim().toLowerCase());
          const specialistEmail = spec ? spec.email : '';

          fetch('/api/email', {
            method: 'POST',
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              type: 'booking_cancelled',
              data: {
                id,
                clientName: bookingToCancel.client_name,
                clientEmail: bookingToCancel.client_email,
                clientPhone: bookingToCancel.client_phone,
                category: bookingToCancel.category,
                serviceName: bookingToCancel.service_name,
                date: bookingToCancel.date,
                time: bookingToCancel.time,
                specialistName: bookingToCancel.specialist_name,
                specialistEmail
              }
            })
          }).catch(err => console.error('Error enviando mail de cancelacion:', err));
        } catch (emailErr) {
          console.error('Error al disparar correo de cancelacion:', emailErr);
        }
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
    }
  },

  updateClientNotes: async (phone, notes) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ notes })
        .eq('phone', phone);

      if (error) throw error;

      set((state) => ({
        clients: state.clients.map(c => c.phone === phone ? { ...c, notes } : c)
      }));
    } catch (err) {
      console.error('Error updating client notes:', err);
    }
  },

  markAsNotGoodClient: async (phone) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ not_so_good_client: true })
        .eq('phone', phone);

      if (error) throw error;

      set((state) => ({
        clients: state.clients.map(c => c.phone === phone ? { ...c, notSoGoodClient: true } : c)
      }));
    } catch (err) {
      console.error('Error marking client as not good:', err);
    }
  },

  incrementClientCancellations: async (phone) => {
    try {
      const client = get().clients.find(c => c.phone === phone);
      const newCount = (client?.cancellationsCount || 0) + 1;
      
      const { error } = await supabase
        .from('clients')
        .update({ cancellations_count: newCount })
        .eq('phone', phone);

      if (error) {
        // Fallback to update notes field
        console.warn('cancellations_count column might not exist, falling back to notes update:', error);
        const existingNotes = client?.notes || '';
        const cleanNotes = existingNotes.replace(/\[Cancelaciones:\s*\d+\]/g, '').trim();
        const updatedNotes = `[Cancelaciones: ${newCount}] ${cleanNotes}`.trim();
        
        await supabase
          .from('clients')
          .update({ notes: updatedNotes })
          .eq('phone', phone);

        set((state) => ({
          clients: state.clients.map((c) =>
            c.phone === phone ? { ...c, cancellationsCount: newCount, notes: updatedNotes } : c
          )
        }));
      } else {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.phone === phone ? { ...c, cancellationsCount: newCount } : c
          )
        }));
      }
    } catch (err) {
      console.error('Error incrementing client cancellations:', err);
    }
  },

  incrementClientNoShows: async (phone) => {
    try {
      const client = get().clients.find(c => c.phone === phone);
      const newCount = (client?.noShowsCount || 0) + 1;
      
      const { error } = await supabase
        .from('clients')
        .update({ no_shows_count: newCount })
        .eq('phone', phone);

      if (error) {
        // Fallback to update notes field
        console.warn('no_shows_count column might not exist, falling back to notes update:', error);
        const existingNotes = client?.notes || '';
        const cleanNotes = existingNotes.replace(/\[Inasistencias:\s*\d+\]/g, '').trim();
        const updatedNotes = `[Inasistencias: ${newCount}] ${cleanNotes}`.trim();
        
        await supabase
          .from('clients')
          .update({ notes: updatedNotes })
          .eq('phone', phone);

        set((state) => ({
          clients: state.clients.map((c) =>
            c.phone === phone ? { ...c, noShowsCount: newCount, notes: updatedNotes } : c
          )
        }));
      } else {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.phone === phone ? { ...c, noShowsCount: newCount } : c
          )
        }));
      }
    } catch (err) {
      console.error('Error incrementing client no shows:', err);
    }
  },

  deleteClient: async (phone) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('phone', phone);

      if (error) throw error;

      set((state) => ({
        clients: state.clients.filter(c => c.phone !== phone),
        bookings: state.bookings.filter(b => b.clientPhone !== phone)
      }));
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  },

  updateClient: async (oldPhone, updatedFields) => {
    try {
      const normOldPhone = normalizePhone(oldPhone) || oldPhone;
      const normNewPhone = normalizePhone(updatedFields.phone) || updatedFields.phone;

      const { error: cErr } = await supabase
        .from('clients')
        .update({
          name: updatedFields.name,
          phone: normNewPhone,
          email: updatedFields.email
        })
        .eq('phone', normOldPhone);

      if (cErr) throw cErr;

      set((state) => ({
        clients: state.clients.map(c => c.phone === normOldPhone ? { ...c, ...updatedFields, phone: normNewPhone } : c),
        bookings: state.bookings.map(b => b.clientPhone === normOldPhone ? { 
          ...b, 
          clientPhone: normNewPhone,
          clientName: updatedFields.name,
          clientEmail: updatedFields.email 
        } : b)
      }));
    } catch (err) {
      console.error('Error updating client:', err);
    }
  },

  markDepositAsTransferred: async (id) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ abono_transferido: true })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, abonoTransferido: true } : b)
      }));
    } catch (err) {
      console.error('Error marking deposit as transferred:', err);
    }
  },

  confirmDeposit: async (id) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ abono_confirmado: true })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, abonoConfirmado: true } : b)
      }));
    } catch (err) {
      console.error('Error confirming deposit:', err);
    }
  },

  updateBookingDetails: async (id, oldPhone, fields) => {
    try {
      const normOldPhone = normalizePhone(oldPhone) || oldPhone;
      const normNewPhone = normalizePhone(fields.clientPhone) || fields.clientPhone;
      const numericPrice = typeof fields.price === 'number'
        ? fields.price
        : parseInt(fields.price.replace(/[^0-9]/g, ''), 10) || 0;

      // 1. Update client details in 'clients' table
      const { error: clientErr } = await supabase
        .from('clients')
        .update({
          name: fields.clientName,
          phone: normNewPhone,
          email: fields.clientEmail
        })
        .eq('phone', normOldPhone);

      if (clientErr) throw clientErr;

      // 2. Update booking details in 'bookings' table
      const { error: bookingErr } = await supabase
        .from('bookings')
        .update({
          client_phone: normNewPhone,
          category: fields.category,
          service_name: fields.serviceName,
          price: numericPrice,
          specialist_name: fields.specialistName,
          date: fields.date,
          time: fields.time,
          status: fields.status
        })
        .eq('id', id);

      if (bookingErr) throw bookingErr;

      // 3. Update local state
      set((state) => {
        // Update client in clients list
        let updatedClients = state.clients.map(c => 
          c.phone === oldPhone ? { ...c, name: fields.clientName, phone: fields.clientPhone, email: fields.clientEmail } : c
        );

        // Update booking in bookings list
        let updatedBookings = state.bookings.map(b => 
          b.id === id ? {
            ...b,
            clientName: fields.clientName,
            clientPhone: fields.clientPhone,
            clientEmail: fields.clientEmail,
            category: fields.category,
            serviceName: fields.serviceName,
            price: `$${numericPrice.toLocaleString('es-CL')}`,
            specialistName: fields.specialistName,
            date: fields.date,
            time: fields.time,
            status: fields.status
          } : b
        );

        // If phone changed, we also need to update clientPhone references on other bookings of the same client
        if (oldPhone !== fields.clientPhone) {
          updatedBookings = updatedBookings.map(b => 
            b.clientPhone === oldPhone ? { ...b, clientPhone: fields.clientPhone } : b
          );
        }

        return {
          bookings: updatedBookings,
          clients: updatedClients
        };
      });
    } catch (err) {
      console.error('Error updating booking details:', err);
      throw err;
    }
  }
}));
