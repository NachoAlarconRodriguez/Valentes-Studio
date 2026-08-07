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

export async function addSpecialistAction(category: string, id: string, specialist: any): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Faltan variables de entorno de Supabase en el servidor');
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false }
  });

  // 1. Insert specialist
  const { error: specError } = await supabase.from('specialists').insert({
    id,
    name: specialist.name,
    role: specialist.role,
    specialty: specialist.specialty,
    bio: specialist.bio,
    avatar: specialist.avatar,
    email: specialist.email,
    profile_type: specialist.profileType,
    assigned_agendas: specialist.assignedAgendas,
    image_url: specialist.imageUrl || '',
    phone: specialist.phone || '',
    is_active: specialist.isActive !== false
  });

  if (specError) {
    console.error('Error inserting specialist in Server Action:', specError);
    throw new Error(specError.message);
  }

  // 2. Create default work shifts for the new specialist
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
    throw new Error(shiftsError.message);
  }
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

  // Try updating by ID first
  const { error, count } = await supabase
    .from('specialists')
    .update(payload, { count: 'exact' })
    .eq('id', specialistId);

  if (error) {
    console.error('Error updating specialist by ID in Server Action:', error);
    throw new Error(error.message);
  }

  // If 0 rows were updated by ID and we have an email, update by email
  if (count === 0 && payload.email) {
    const { error: emailError } = await supabase
      .from('specialists')
      .update(payload)
      .eq('email', payload.email);

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

  const { error } = await supabase
    .from('specialists')
    .delete()
    .eq('id', specialistId);

  if (error) {
    console.error('Error deleting specialist in Server Action:', error);
    throw new Error(error.message);
  }
}

