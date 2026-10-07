import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { specialistId, email, imageUrl, payload: passedPayload } = body;

    if (!specialistId && !email) {
      return NextResponse.json({ error: 'Se requiere specialistId o email' }, { status: 400 });
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

    const updatePayload: any = { ...(passedPayload || {}) };
    if (imageUrl) {
      updatePayload.image_url = imageUrl;
    }
    // Also support direct top-level fields
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.role !== undefined) updatePayload.role = body.role;
    if (body.specialty !== undefined) updatePayload.specialty = body.specialty;
    if (body.bio !== undefined) updatePayload.bio = body.bio;
    if (body.avatar !== undefined) updatePayload.avatar = body.avatar;
    if (body.profileType !== undefined) updatePayload.profile_type = body.profileType;
    if (body.profile_type !== undefined) updatePayload.profile_type = body.profile_type;
    if (body.assignedAgendas !== undefined) updatePayload.assigned_agendas = body.assignedAgendas;
    if (body.assigned_agendas !== undefined) updatePayload.assigned_agendas = body.assigned_agendas;
    if (body.phone !== undefined) updatePayload.phone = body.phone;
    if (body.isActive !== undefined) updatePayload.is_active = body.isActive;
    if (body.is_active !== undefined) updatePayload.is_active = body.is_active;
    if (body.canAccessAdmin !== undefined) updatePayload.can_access_admin = body.canAccessAdmin;
    if (body.can_access_admin !== undefined) updatePayload.can_access_admin = body.can_access_admin;
    if (body.canBlockSchedule !== undefined) updatePayload.can_block_schedule = body.canBlockSchedule;
    if (body.can_block_schedule !== undefined) updatePayload.can_block_schedule = body.can_block_schedule;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No se enviaron campos para actualizar' }, { status: 400 });
    }

    let updated = false;

    // Try update by ID first
    if (specialistId) {
      const { data: dataById, error: errById } = await supabase
        .from('specialists')
        .update(updatePayload)
        .eq('id', specialistId)
        .select('id');

      if (errById) {
        console.error('[update-specialist] Error updating by ID:', errById);
      } else if (dataById && dataById.length > 0) {
        console.log(`[update-specialist] Update by ID "${specialistId}": rows=${dataById.length}`);
        updated = true;
      }
    }

    // Fallback: try update by email
    const targetEmail = email || updatePayload.email;
    if (!updated && targetEmail) {
      const { data: dataByEmail, error: errByEmail } = await supabase
        .from('specialists')
        .update(updatePayload)
        .eq('email', targetEmail)
        .select('id');

      if (errByEmail) {
        console.error('[update-specialist] Error updating by email:', errByEmail);
      } else if (dataByEmail && dataByEmail.length > 0) {
        console.log(`[update-specialist] Update by email "${targetEmail}": rows=${dataByEmail.length}`);
        updated = true;
      }
    }

    if (!updated) {
      console.warn(`[update-specialist] No rows updated for id="${specialistId}" email="${targetEmail}"`);
      return NextResponse.json({ 
        warning: 'No se encontró ningún especialista con ese ID o email',
        specialistId,
        email: targetEmail
      }, { status: 200 });
    }

    return NextResponse.json({ success: true, updated: true });
  } catch (error: any) {
    console.error('[update-specialist] Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
