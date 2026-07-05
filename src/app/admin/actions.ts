'use server';

import { createClient } from '@supabase/supabase-js';

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
  const filename = `cms_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;

  const { data, error } = await supabase.storage
    .from('cms-images')
    .upload(filename, buffer, {
      contentType: file.type || 'image/jpeg',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error in uploadImageAction:', error);
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase.storage.from('cms-images').getPublicUrl(filename);
  return publicUrlData.publicUrl;
}
