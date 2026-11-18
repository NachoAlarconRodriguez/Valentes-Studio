'use server';

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export async function uploadImageAction(formData: FormData): Promise<string> {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No se proporcionó ningún archivo');
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Faltan variables de entorno de Supabase en el servidor');
  }

  // Create a Supabase client with the service role key to bypass RLS
  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const extLower = ext?.toLowerCase();
  const filename = `cms_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

  let contentType = file.type;
  if (!contentType || contentType === 'application/octet-stream') {
    if (extLower === 'mp4') contentType = 'video/mp4';
    else if (extLower === 'webm') contentType = 'video/webm';
    else if (extLower === 'mov') contentType = 'video/quicktime';
    else if (extLower === 'png') contentType = 'image/png';
    else if (extLower === 'webp') contentType = 'image/webp';
    else if (extLower === 'gif') contentType = 'image/gif';
    else contentType = 'image/jpeg';
  }

  let finalBuffer: any = buffer;
  let finalContentType = contentType;
  let finalFilename = filename;

  const isImage = contentType.startsWith('image/');
  const isSvgOrGif = contentType.includes('svg') || contentType.includes('gif') || extLower === 'svg' || extLower === 'gif';

  if (isImage && !isSvgOrGif) {
    try {
      finalBuffer = await sharp(buffer)
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      finalContentType = 'image/webp';
      
      const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
      finalFilename = `${nameWithoutExt}.webp`;
    } catch (sharpError) {
      console.error('Error compressing image with sharp in Server Action, uploading original:', sharpError);
    }
  }

  const { data, error } = await supabase.storage
    .from('cms-images')
    .upload(finalFilename, finalBuffer, {
      contentType: finalContentType,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error in uploadImageAction:', error);
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase.storage.from('cms-images').getPublicUrl(finalFilename);
  return publicUrlData.publicUrl;
}

export async function addSpecialistAction(
  category: string,
  id: string,
  specialist: any,
  options?: {
    serviceIdsToAssign?: string[];
    createAuthUser?: boolean;
    accessRequestId?: number | string;
  }
): Promise<{ id: string; tempPassword: string | null; updatedServiceIds: string[] }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Faltan variables de entorno de Supabase en el servidor');
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const cleanName = String(specialist.name || '').trim();
  const cleanEmail = String(specialist.email || '').trim().toLowerCase();
  const assignedAgendas: string[] =
    Array.isArray(specialist.assignedAgendas) && specialist.assignedAgendas.length > 0
      ? specialist.assignedAgendas
      : [category || 'barberia'];

  // 1. Create or update Auth user without affecting Admin session
  let tempPassword: string | null = null;
  let newlyCreatedAuthUserId: string | null = null;
  const shouldCreateAuth = options?.createAuthUser !== false && specialist.canAccessAdmin !== false && Boolean(cleanEmail);

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
      if (errMsgLower.includes('already') || errMsgLower.includes('registered') || errMsgLower.includes('exists') || (createAuthErr as any).status === 422) {
        const { data: usersList } = await supabase.auth.admin.listUsers();
        const existingAuthUser = usersList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (existingAuthUser) {
          await supabase.auth.admin.updateUserById(existingAuthUser.id, {
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              ...(existingAuthUser.user_metadata || {}),
              require_password_change: true,
              firstName,
              lastName
            }
          });
        }
      } else {
        throw new Error(`Error al crear usuario de acceso: ${createAuthErr.message}`);
      }
    } else if (createdAuth?.user?.id) {
      newlyCreatedAuthUserId = createdAuth.user.id;
    }
  }

  // 2. Insert specialist
  const insertData: any = {
    id,
    name: cleanName,
    role: specialist.role,
    specialty: specialist.specialty,
    bio: specialist.bio,
    avatar: specialist.avatar,
    email: cleanEmail,
    profile_type: specialist.profileType,
    assigned_agendas: assignedAgendas,
    image_url: specialist.imageUrl || '',
    phone: specialist.phone || '',
    is_active: specialist.isActive !== false,
    can_access_admin: specialist.canAccessAdmin !== false,
    can_block_schedule: specialist.canBlockSchedule !== false
  };

  let { error: specError } = await supabase.from('specialists').insert(insertData);

  // Fallback si alguna de las nuevas columnas aún no se ha creado en la base de datos
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
    console.error('Error inserting specialist in Server Action:', specError);
    if (newlyCreatedAuthUserId) {
      await supabase.auth.admin.deleteUser(newlyCreatedAuthUserId).catch(() => {});
    }
    throw new Error(specError.message);
  }

  // 3. Create default work shifts for the new specialist
  const shiftsToInsert = [];
  // Mon-Fri active
  for (let i = 1; i <= 5; i++) {
    shiftsToInsert.push({
      id: `${id}_shift_${i}`,
      specialist_id: id,
      day_of_week: i,
      is_active: true,
      start_time: '09:00',
      end_time: '18:00',
      has_break: true,
      break_start_time: '13:00',
      break_end_time: '14:00'
    });
  }
  // Sat active
  shiftsToInsert.push({
    id: `${id}_shift_6`,
    specialist_id: id,
    day_of_week: 6,
    is_active: true,
    start_time: '09:00',
    end_time: '13:00',
    has_break: false,
    break_start_time: '13:00',
    break_end_time: '14:00'
  });
  // Sun inactive
  shiftsToInsert.push({
    id: `${id}_shift_0`,
    specialist_id: id,
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
    console.error('Error inserting default shifts in Server Action:', shiftsError);
    await supabase.from('specialists').delete().eq('id', id);
    if (newlyCreatedAuthUserId) {
      await supabase.auth.admin.deleteUser(newlyCreatedAuthUserId).catch(() => {});
    }
    throw new Error(shiftsError.message);
  }

  // 4. Additive assignment to services.specialist_ids
  const updatedServiceIds: string[] = [];
  try {
    let targetServices: any[] = [];
    if (Array.isArray(options?.serviceIdsToAssign)) {
      if (options!.serviceIdsToAssign.length > 0) {
        const { data: srvData } = await supabase
          .from('services')
          .select('id, specialist_ids')
          .in('id', options!.serviceIdsToAssign);
        targetServices = srvData || [];
      }
    } else {
      const { data: srvData } = await supabase
        .from('services')
        .select('id, specialist_ids, is_active')
        .in('category', assignedAgendas);
      targetServices = (srvData || []).filter((s: any) => s.is_active !== false);
    }

    for (const srv of targetServices) {
      const currentIds: string[] = Array.isArray(srv.specialist_ids) ? srv.specialist_ids : [];
      if (!currentIds.includes(id)) {
        const nextIds = Array.from(new Set([...currentIds, id]));
        const { error: srvUpdateErr } = await supabase
          .from('services')
          .update({ specialist_ids: nextIds })
          .eq('id', srv.id);
        if (!srvUpdateErr) {
          updatedServiceIds.push(srv.id);
        }
      } else {
        updatedServiceIds.push(srv.id);
      }
    }
  } catch (srvErr) {
    console.warn('Warning assigning services in Server Action:', srvErr);
  }

  if (options?.accessRequestId !== undefined && options?.accessRequestId !== null) {
    await supabase
      .from('access_requests')
      .update({ status: 'approved' })
      .eq('id', options.accessRequestId);
  }

  return { id, tempPassword, updatedServiceIds };
}

export async function updateSpecialistAction(specialistId: string, payload: any): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Faltan variables de entorno de Supabase en el servidor');
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false }
  });

  let updatePayload = { ...payload };

  // Try updating by ID first
  let { error, count } = await supabase
    .from('specialists')
    .update(updatePayload, { count: 'exact' })
    .eq('id', specialistId);

  // Fallback si alguna de las nuevas columnas aún no se ha creado en la base de datos
  if (error && (error.message?.includes('can_access_admin') || error.message?.includes('can_block_schedule') || (error as any).code === '42703')) {
    delete updatePayload.can_access_admin;
    delete updatePayload.can_block_schedule;
    const retry = await supabase
      .from('specialists')
      .update(updatePayload, { count: 'exact' })
      .eq('id', specialistId);
    error = retry.error;
    count = retry.count;
  }

  if (error) {
    console.error('Error updating specialist by ID in Server Action:', error);
    throw new Error(error.message);
  }

  // If 0 rows were updated by ID and we have an email, update by email
  if (count === 0 && updatePayload.email) {
    const { error: emailError } = await supabase
      .from('specialists')
      .update(updatePayload)
      .eq('email', updatePayload.email);

    if (emailError) {
      console.error('Error updating specialist by Email in Server Action:', emailError);
      throw new Error(emailError.message);
    }
  }
}

export async function deleteSpecialistAction(specialistId: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Faltan variables de entorno de Supabase en el servidor');
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false }
  });

  // 1. Obtener los datos del especialista (para saber su email) antes de borrarlo
  const { data: spec } = await supabase
    .from('specialists')
    .select('email')
    .eq('id', specialistId)
    .maybeSingle();

  // 2. Si tiene email, buscar y eliminar su cuenta en Supabase Auth
  if (spec?.email) {
    try {
      const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
      if (!listErr && usersData?.users) {
        const targetUser = usersData.users.find(
          u => u.email?.toLowerCase() === spec.email.toLowerCase()
        );
        if (targetUser) {
          await supabase.auth.admin.deleteUser(targetUser.id);
        }
      }
    } catch (authErr) {
      console.error('Error eliminando usuario de Supabase Auth:', authErr);
      // No frenar la eliminación de la tabla specialists si la cuenta de auth ya no existía
    }
  }

  // 3. Eliminar de la tabla specialists
  const { error } = await supabase
    .from('specialists')
    .delete()
    .eq('id', specialistId);

  if (error) {
    console.error('Error deleting specialist in Server Action:', error);
    throw new Error(error.message);
  }
}

