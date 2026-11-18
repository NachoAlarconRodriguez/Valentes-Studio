import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const cleanText = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      category = 'barberia',
      id: passedId,
      specialist,
      serviceIdsToAssign,
      createAuthUser = true,
      accessRequestId
    } = body;

    if (!specialist || !specialist.name || !specialist.email) {
      return NextResponse.json(
        { error: 'El nombre y el correo electrónico del profesional son obligatorios.' },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      console.error('[create-specialist] Faltan variables de entorno de Supabase');
      return NextResponse.json(
        { error: 'Faltan variables de entorno de Supabase en el servidor.' },
        { status: 500 }
      );
    }

    const supabase = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const cleanName = String(specialist.name).trim();
    const cleanEmail = String(specialist.email).trim().toLowerCase();
    const prefix = String(category || 'barberia').substring(0, 2);
    let finalId = passedId || `${prefix}_sp_${Date.now()}`;

    const assignedAgendas: string[] =
      Array.isArray(specialist.assignedAgendas) && specialist.assignedAgendas.length > 0
        ? specialist.assignedAgendas
        : [category || 'barberia'];

    const initials = cleanName
      .split(/\s+/)
      .filter(Boolean)
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    // 1. Verificar duplicados en tabla specialists para proteger agenda y data histórica
    const { data: existingSpecs, error: checkErr } = await supabase
      .from('specialists')
      .select('id, name, email');

    if (checkErr) {
      console.error('[create-specialist] Error consultando especialistas existentes:', checkErr);
      return NextResponse.json(
        { error: 'Error al verificar profesionales existentes: ' + checkErr.message },
        { status: 500 }
      );
    }

    const existingByEmail = (existingSpecs || []).find(
      (s: any) => s.email && String(s.email).trim().toLowerCase() === cleanEmail
    );

    const existingByName = (existingSpecs || []).find(
      (s: any) =>
        s.name &&
        cleanText(s.name) === cleanText(cleanName) &&
        (!existingByEmail || s.id !== existingByEmail.id)
    );

    if (existingByName) {
      return NextResponse.json(
        {
          error: `Ya existe un profesional registrado con el nombre "${existingByName.name}". Usa un segundo nombre o apellido para distinguirlos y proteger el historial de la agenda.`
        },
        { status: 409 }
      );
    }

    if (existingByEmail && !accessRequestId) {
      return NextResponse.json(
        {
          error: `Ya existe un profesional registrado con el correo "${cleanEmail}".`
        },
        { status: 409 }
      );
    }

    // Si viene desde aprobación de solicitud y el especialista ya existía en la tabla, reutilizamos su ID
    const reuseExistingSpecialist = Boolean(existingByEmail && accessRequestId);
    if (reuseExistingSpecialist && existingByEmail) {
      finalId = existingByEmail.id;
    }

    // 2. Crear o actualizar cuenta en Supabase Auth (usando Admin API para NO cerrar sesión del Admin)
    let tempPassword: string | null = null;
    let newlyCreatedAuthUserId: string | null = null;
    const shouldCreateAuth = createAuthUser !== false && specialist.canAccessAdmin !== false;

    if (shouldCreateAuth) {
      tempPassword = `TempValentes_${Math.floor(100000 + Math.random() * 900000)}`;
      const nameParts = cleanName.split(/\s+/);
      const firstName = nameParts[0] || cleanName;
      const lastName = nameParts.slice(1).join(' ') || '';

      const { data: createdAuth, error: createAuthErr } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          require_password_change: true,
          firstName,
          lastName
        }
      });

      if (createAuthErr) {
        const errMsgLower = (createAuthErr.message || '').toLowerCase();
        const isAlreadyRegistered =
          errMsgLower.includes('already') ||
          errMsgLower.includes('registered') ||
          errMsgLower.includes('exists') ||
          (createAuthErr as any).status === 422;

        if (isAlreadyRegistered) {
          // Buscar el usuario existente en Auth y actualizar su contraseña temporal
          const { data: usersList, error: listErr } = await supabase.auth.admin.listUsers();
          const existingAuthUser = !listErr
            ? usersList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail)
            : null;

          if (existingAuthUser) {
            const { error: updateAuthErr } = await supabase.auth.admin.updateUserById(
              existingAuthUser.id,
              {
                password: tempPassword,
                email_confirm: true,
                user_metadata: {
                  ...(existingAuthUser.user_metadata || {}),
                  require_password_change: true,
                  firstName,
                  lastName
                }
              }
            );
            if (updateAuthErr) {
              console.error('[create-specialist] Error actualizando usuario Auth existente:', updateAuthErr);
              return NextResponse.json(
                { error: `No se pudo actualizar la credencial de acceso: ${updateAuthErr.message}` },
                { status: 500 }
              );
            }
          } else {
            console.error('[create-specialist] Error listando usuario Auth existente:', listErr || createAuthErr);
            return NextResponse.json(
              { error: `Error al configurar cuenta de acceso: ${createAuthErr.message}` },
              { status: 500 }
            );
          }
        } else {
          console.error('[create-specialist] Error creando usuario en Supabase Auth:', createAuthErr);
          return NextResponse.json(
            { error: `Error al crear usuario de acceso: ${createAuthErr.message}` },
            { status: 500 }
          );
        }
      } else if (createdAuth?.user?.id) {
        newlyCreatedAuthUserId = createdAuth.user.id;
      }
    }

    // 3. Insertar profesional en tabla specialists (si no existía previamente)
    let insertedNewSpecialist = false;
    if (!reuseExistingSpecialist) {
      const insertData: any = {
        id: finalId,
        name: cleanName,
        role: specialist.role || 'Barbero',
        specialty: specialist.specialty || 'Barbería',
        bio: specialist.bio || '',
        avatar: specialist.avatar || initials,
        email: cleanEmail,
        profile_type: specialist.profileType || 'barber',
        assigned_agendas: assignedAgendas,
        image_url: specialist.imageUrl || '',
        phone: specialist.phone || '',
        is_active: specialist.isActive !== false,
        can_access_admin: specialist.canAccessAdmin !== false,
        can_block_schedule: specialist.canBlockSchedule !== false
      };

      let { error: specError } = await supabase.from('specialists').insert(insertData);

      // Fallback si las columnas opcionales aún no existen en el esquema
      if (
        specError &&
        (specError.message?.includes('can_access_admin') ||
          specError.message?.includes('can_block_schedule') ||
          (specError as any).code === '42703' ||
          (specError as any).code === 'PGRST204')
      ) {
        delete insertData.can_access_admin;
        delete insertData.can_block_schedule;
        const retry = await supabase.from('specialists').insert(insertData);
        specError = retry.error;
      }

      if (specError) {
        console.error('[create-specialist] Error insertando en specialists:', specError);
        if (newlyCreatedAuthUserId) {
          await supabase.auth.admin.deleteUser(newlyCreatedAuthUserId).catch(() => {});
        }
        return NextResponse.json(
          { error: `Error al guardar el profesional en la base de datos: ${specError.message}` },
          { status: 500 }
        );
      }
      insertedNewSpecialist = true;
    }

    // 4. Crear los 7 turnos por defecto en work_shifts (si no tiene turnos aún)
    const { data: existingShifts } = await supabase
      .from('work_shifts')
      .select('id')
      .eq('specialist_id', finalId)
      .limit(1);

    if (!existingShifts || existingShifts.length === 0) {
      const shiftsToInsert = [];
      for (let i = 1; i <= 5; i++) {
        shiftsToInsert.push({
          id: `${finalId}_shift_${i}`,
          specialist_id: finalId,
          day_of_week: i,
          is_active: true,
          start_time: '09:00',
          end_time: '18:00',
          has_break: true,
          break_start_time: '13:00',
          break_end_time: '14:00'
        });
      }
      shiftsToInsert.push({
        id: `${finalId}_shift_6`,
        specialist_id: finalId,
        day_of_week: 6,
        is_active: true,
        start_time: '09:00',
        end_time: '13:00',
        has_break: false,
        break_start_time: '13:00',
        break_end_time: '14:00'
      });
      shiftsToInsert.push({
        id: `${finalId}_shift_0`,
        specialist_id: finalId,
        day_of_week: 0,
        is_active: false,
        start_time: '09:00',
        end_time: '18:00',
        has_break: false,
        break_start_time: '13:00',
        break_end_time: '14:00'
      });

      const { error: shiftsError } = await supabase.from('work_shifts').insert(shiftsToInsert);
      if (shiftsError) {
        console.error('[create-specialist] Error insertando work_shifts, ejecutando rollback:', shiftsError);
        if (insertedNewSpecialist) {
          await supabase.from('specialists').delete().eq('id', finalId);
        }
        if (newlyCreatedAuthUserId) {
          await supabase.auth.admin.deleteUser(newlyCreatedAuthUserId).catch(() => {});
        }
        return NextResponse.json(
          { error: `Error al crear los turnos iniciales del profesional: ${shiftsError.message}` },
          { status: 500 }
        );
      }
    }

    // 5. Asociar de forma aditiva el nuevo profesional a los servicios (sin sobrescribir profesionales existentes)
    const updatedServiceIds: string[] = [];
    try {
      let targetServices: any[] = [];

      if (Array.isArray(serviceIdsToAssign)) {
        if (serviceIdsToAssign.length > 0) {
          const { data: srvData } = await supabase
            .from('services')
            .select('id, specialist_ids')
            .in('id', serviceIdsToAssign);
          targetServices = srvData || [];
        }
      } else {
        // Por defecto: todos los servicios activos de las agendas asignadas al profesional
        const { data: srvData } = await supabase
          .from('services')
          .select('id, specialist_ids, is_active')
          .in('category', assignedAgendas);
        targetServices = (srvData || []).filter((s: any) => s.is_active !== false);
      }

      for (const srv of targetServices) {
        const currentIds: string[] = Array.isArray(srv.specialist_ids) ? srv.specialist_ids : [];
        if (!currentIds.includes(finalId)) {
          const nextIds = Array.from(new Set([...currentIds, finalId]));
          const { error: srvUpdateErr } = await supabase
            .from('services')
            .update({ specialist_ids: nextIds })
            .eq('id', srv.id);

          if (!srvUpdateErr) {
            updatedServiceIds.push(srv.id);
          } else {
            console.warn(`[create-specialist] No se pudo vincular servicio ${srv.id}:`, srvUpdateErr);
          }
        } else {
          updatedServiceIds.push(srv.id);
        }
      }
    } catch (srvErr) {
      console.warn('[create-specialist] Advertencia al asociar servicios:', srvErr);
    }

    // 6. Si proviene de una solicitud de acceso, marcarla como 'approved'
    if (accessRequestId !== undefined && accessRequestId !== null) {
      const { error: reqUpdateErr } = await supabase
        .from('access_requests')
        .update({ status: 'approved' })
        .eq('id', accessRequestId);
      if (reqUpdateErr) {
        console.warn('[create-specialist] No se pudo actualizar estado de access_requests:', reqUpdateErr);
      }
    }

    return NextResponse.json({
      success: true,
      id: finalId,
      tempPassword,
      updatedServiceIds
    });
  } catch (error: any) {
    console.error('[create-specialist] Error inesperado:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al crear el profesional.' },
      { status: 500 }
    );
  }
}
