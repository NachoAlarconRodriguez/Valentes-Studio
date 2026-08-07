import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { specialistId, email, imageUrl } = body;

    if (!specialistId && !email) {
      return NextResponse.json({ error: 'Se requiere specialistId o email' }, { status: 400 });
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'Se requiere imageUrl' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      console.error('[update-specialist] Missing Supabase env vars');
      return NextResponse.json({ error: 'Faltan variables de entorno de Supabase' }, { status: 500 });
    }

    const supabase = createClient(url, serviceRoleKey, {
      auth: { persistSession: false }
    });

    const payload = { image_url: imageUrl };
    let updated = false;

    // Try update by ID first
    if (specialistId) {
      const { data: dataById, error: errById } = await supabase
        .from('specialists')
        .update(payload)
        .eq('id', specialistId)
        .select('id');

      if (errById) {
        console.error('[update-specialist] Error updating by ID:', errById);
      } else {
        console.log(`[update-specialist] Update by ID "${specialistId}": rows=${dataById?.length}`);
        if (dataById && dataById.length > 0) updated = true;
      }
    }

    // Fallback: try update by email
    if (!updated && email) {
      const { data: dataByEmail, error: errByEmail } = await supabase
        .from('specialists')
        .update(payload)
        .eq('email', email)
        .select('id');

      if (errByEmail) {
        console.error('[update-specialist] Error updating by email:', errByEmail);
      } else {
        console.log(`[update-specialist] Update by email "${email}": rows=${dataByEmail?.length}`);
        if (dataByEmail && dataByEmail.length > 0) updated = true;
      }
    }

    if (!updated) {
      console.warn(`[update-specialist] No rows updated for id="${specialistId}" email="${email}"`);
      return NextResponse.json({ 
        warning: 'No se encontró ningún especialista con ese ID o email',
        specialistId,
        email
      }, { status: 200 });
    }

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error('[update-specialist] Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
