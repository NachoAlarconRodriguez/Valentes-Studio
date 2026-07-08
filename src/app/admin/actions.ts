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
