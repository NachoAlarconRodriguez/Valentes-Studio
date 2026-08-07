import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import convert from 'heic-convert';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'El archivo recibido está vacío o corrupto (0 bytes)' }, { status: 400 });
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
    const extLower = ext?.toLowerCase();

    // Validar límite de videos (15 MB) y formatos permitidos en el backend
    const isVideo = file.type.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(extLower || '');
    if (isVideo) {
      const MAX_VIDEO_SIZE = 15 * 1024 * 1024; // 15 MB
      if (file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json({ error: 'El video supera el límite permitido de 15 MB.' }, { status: 400 });
      }
      const validFormats = ['video/mp4', 'video/webm', 'video/quicktime', 'mp4', 'webm', 'mov'];
      const fileFormat = file.type?.toLowerCase() || extLower || '';
      const isValid = validFormats.some(f => fileFormat.includes(f));
      if (!isValid) {
        return NextResponse.json({ error: 'Formato de video no válido. Usa mp4, webm o mov.' }, { status: 400 });
      }
    }

    const filename = `cms_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

    let contentType = file.type;
    if (!contentType || contentType === 'application/octet-stream') {
      if (extLower === 'mp4') contentType = 'video/mp4';
      else if (extLower === 'webm') contentType = 'video/webm';
      else if (extLower === 'mov') contentType = 'video/quicktime';
      else if (extLower === 'png') contentType = 'image/png';
      else if (extLower === 'webp') contentType = 'image/webp';
      else if (extLower === 'gif') contentType = 'image/gif';
      else if (extLower === 'heic' || extLower === 'heif') contentType = 'image/heic';
      else contentType = 'image/jpeg';
    }

    let finalBuffer: any = buffer;
    let finalContentType = contentType;
    let finalFilename = filename;

    const headerStr = buffer.slice(4, 12).toString('ascii');
    const isMagicHeic = headerStr.includes('ftyp') || headerStr.includes('heic') || headerStr.includes('mif1');
    const isHeic = isMagicHeic || contentType.includes('heic') || contentType.includes('heif') || extLower === 'heic' || extLower === 'heif';
    const isImage = contentType.startsWith('image/') || isHeic;
    const isSvgOrGif = contentType.includes('svg') || contentType.includes('gif') || extLower === 'svg' || extLower === 'gif';

    if (isImage && !isSvgOrGif) {
      let imageBufferToProcess: Buffer = buffer;

      if (isHeic) {
        try {
          const output = await convert({
            buffer,
            format: 'JPEG',
            quality: 0.9
          });
          imageBufferToProcess = Buffer.from(output);
          contentType = 'image/jpeg';
        } catch (heicErr) {
          console.error('Error converting HEIC with heic-convert:', heicErr);
        }
      }

      try {
        finalBuffer = await sharp(imageBufferToProcess)
          .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        finalContentType = 'image/webp';
        
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
        finalFilename = `${nameWithoutExt}.webp`;
      } catch (sharpError) {
        console.error('Error compressing image with sharp, trying HEIC fallback:', sharpError);
        try {
          const output = await convert({
            buffer,
            format: 'JPEG',
            quality: 0.85
          });
          const convertedJpeg = Buffer.from(output);
          finalBuffer = await sharp(convertedJpeg)
            .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
          finalContentType = 'image/webp';
          const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
          finalFilename = `${nameWithoutExt}.webp`;
        } catch (fallbackErr) {
          console.error('Fallback HEIC conversion failed, uploading original:', fallbackErr);
        }
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
      console.error('Error uploading to Supabase Storage:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from('cms-images').getPublicUrl(finalFilename);
    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error('Error in API upload handler:', error);
    return NextResponse.json({ error: error.message || 'Error interno al procesar el archivo' }, { status: 500 });
  }
}

