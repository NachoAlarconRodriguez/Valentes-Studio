import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      return NextResponse.json({ error: 'Faltan variables de entorno de Supabase en el servidor' }, { status: 500 });
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
    const filename = `cms_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

    let contentType = file.type;
    if (!contentType || contentType === 'application/octet-stream') {
      const extLower = ext?.toLowerCase();
      if (extLower === 'mp4') contentType = 'video/mp4';
      else if (extLower === 'webm') contentType = 'video/webm';
      else if (extLower === 'mov') contentType = 'video/quicktime';
      else if (extLower === 'png') contentType = 'image/png';
      else if (extLower === 'webp') contentType = 'image/webp';
      else if (extLower === 'gif') contentType = 'image/gif';
      else contentType = 'image/jpeg';
    }

    const { data, error } = await supabase.storage
      .from('cms-images')
      .upload(filename, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading to Supabase Storage:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from('cms-images').getPublicUrl(filename);
    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error('Error in API upload handler:', error);
    return NextResponse.json({ error: error.message || 'Error interno al procesar el archivo' }, { status: 500 });
  }
}
