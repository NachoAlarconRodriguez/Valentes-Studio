import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { specialistId, email, imageUrl, payload: passedPayload } = body;

    if (!specialistId && !email && !body.searchName && !body.normalizeVacationBlocks) {
      return NextResponse.json({ error: 'Se requiere specialistId, email o searchName' }, { status: 400 });
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

    if (body.normalizeVacationBlocks) {
      const { data: allBlocks, error: tbFetchErr } = await supabase
        .from('time_blocks')
        .select('*')
        .order('date', { ascending: true });

      if (tbFetchErr) {
        return NextResponse.json({ error: tbFetchErr.message }, { status: 500 });
      }

      const seenFullDayKeys = new Map<string, any>();
      const idsToDelete: string[] = [];
      const idsToUpdateFullDay: string[] = [];

      for (const tb of allBlocks || []) {
        const reasonClean = String(tb.reason || '').trim().toLowerCase();
        const isFullDayReason = reasonClean === 'vacaciones' || reasonClean.startsWith('feriado');
        if (isFullDayReason) {
          const key = `${tb.specialist_id}__${tb.date}__${reasonClean}`;
          if (seenFullDayKeys.has(key)) {
            idsToDelete.push(tb.id);
          } else {
            seenFullDayKeys.set(key, tb);
            if (tb.start_time !== '00:00' || tb.end_time !== '23:59') {
              idsToUpdateFullDay.push(tb.id);
            }
          }
        }
      }

      if (idsToDelete.length > 0) {
        await supabase.from('time_blocks').delete().in('id', idsToDelete);
      }

      if (idsToUpdateFullDay.length > 0) {
        await supabase
          .from('time_blocks')
          .update({ start_time: '00:00', end_time: '23:59' })
          .in('id', idsToUpdateFullDay);
      }

      const { data: remainingBlocks } = await supabase
        .from('time_blocks')
        .select('*')
        .order('date', { ascending: true });

      return NextResponse.json({
        success: true,
        updatedFullDayCount: idsToUpdateFullDay.length,
        deletedDuplicatesCount: idsToDelete.length,
        remainingBlocks: remainingBlocks || []
      });
    }

    const updatePayload: any = { ...(passedPayload || {}) };
    let uploadedPublicUrl: string | null = null;

    if (body.imageBase64) {
      const cleanBase64 = String(body.imageBase64).replace(/^data:[^;]+;base64,/, '');
      const imgBuffer = Buffer.from(cleanBase64, 'base64');
      const imgContentType = body.imageContentType || 'image/webp';
      const imgExt = imgContentType.includes('png') ? 'png' : imgContentType.includes('jpeg') || imgContentType.includes('jpg') ? 'jpg' : 'webp';
      const storageFilename = `specialist_${specialistId || Date.now()}_${Date.now()}.${imgExt}`;

      const { error: uploadErr } = await supabase.storage
        .from('cms-images')
        .upload(storageFilename, imgBuffer, {
          contentType: imgContentType,
          cacheControl: '3600',
          upsert: true
        });

      if (uploadErr) {
        console.error('[update-specialist] Error uploading imageBase64 to Storage:', uploadErr);
        return NextResponse.json({ error: `Error subiendo imagen a Storage: ${uploadErr.message}` }, { status: 500 });
      }

      const { data: pubData } = supabase.storage.from('cms-images').getPublicUrl(storageFilename);
      uploadedPublicUrl = pubData.publicUrl;
      updatePayload.image_url = uploadedPublicUrl;
    } else if (imageUrl) {
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
    let updatedRecord: any = null;

    // Try update by ID first
    if (specialistId) {
      let { data: dataById, error: errById } = await supabase
        .from('specialists')
        .update(updatePayload)
        .eq('id', specialistId)
        .select('id, name, email, image_url');

      if (
        errById &&
        (errById.message?.includes('can_access_admin') ||
          errById.message?.includes('can_block_schedule') ||
          (errById as any).code === '42703' ||
          (errById as any).code === 'PGRST204')
      ) {
        delete updatePayload.can_access_admin;
        delete updatePayload.can_block_schedule;
        const retry = await supabase
          .from('specialists')
          .update(updatePayload)
          .eq('id', specialistId)
          .select('id, name, email, image_url');
        dataById = retry.data;
        errById = retry.error;
      }

      if (errById) {
        console.error('[update-specialist] Error updating by ID:', errById);
      } else if (dataById && dataById.length > 0) {
        console.log(`[update-specialist] Update by ID "${specialistId}": rows=${dataById.length}`);
        updated = true;
        updatedRecord = dataById[0];
      }
    }

    // Fallback: try update by email (case-insensitive)
    const targetEmail = email || updatePayload.email;
    if (!updated && targetEmail) {
      let { data: dataByEmail, error: errByEmail } = await supabase
        .from('specialists')
        .update(updatePayload)
        .ilike('email', String(targetEmail).trim())
        .select('id, name, email, image_url');

      if (
        errByEmail &&
        (errByEmail.message?.includes('can_access_admin') ||
          errByEmail.message?.includes('can_block_schedule') ||
          (errByEmail as any).code === '42703' ||
          (errByEmail as any).code === 'PGRST204')
      ) {
        delete updatePayload.can_access_admin;
        delete updatePayload.can_block_schedule;
        const retry = await supabase
          .from('specialists')
          .update(updatePayload)
          .ilike('email', String(targetEmail).trim())
          .select('id, name, email, image_url');
        dataByEmail = retry.data;
        errByEmail = retry.error;
      }

      if (errByEmail) {
        console.error('[update-specialist] Error updating by email:', errByEmail);
      } else if (dataByEmail && dataByEmail.length > 0) {
        console.log(`[update-specialist] Update by email "${targetEmail}": rows=${dataByEmail.length}`);
        updated = true;
        updatedRecord = dataByEmail[0];
      }
    }

    // Fallback: try update by searchName (case-insensitive substring)
    if (!updated && body.searchName) {
      let { data: dataByName, error: errByName } = await supabase
        .from('specialists')
        .update(updatePayload)
        .ilike('name', `%${String(body.searchName).trim()}%`)
        .select('id, name, email, image_url');

      if (!errByName && dataByName && dataByName.length > 0) {
        updated = true;
        updatedRecord = dataByName[0];
      }
    }

    if (!updated) {
      const { data: allSpecs } = await supabase.from('specialists').select('id, name, email');
      console.warn(`[update-specialist] No rows updated for id="${specialistId}" email="${targetEmail}"`);
      return NextResponse.json({ 
        warning: 'No se encontró ningún especialista con ese ID o email',
        specialistId,
        email: targetEmail,
        imageUrl: uploadedPublicUrl,
        availableSpecialists: allSpecs || []
      }, { status: 200 });
    }

    // Si se habilita can_access_admin o se solicita asignar/resetear contraseña temporal
    let assignedTempPassword: string | null = null;
    if (targetEmail && (updatePayload.can_access_admin === true || body.tempPassword || body.resetTempPassword)) {
      const cleanEmail = String(targetEmail).trim().toLowerCase();
      const desiredPass = body.tempPassword ? String(body.tempPassword) : 'Valentes2026!';
      const forceReset = Boolean(body.tempPassword || body.resetTempPassword);

      const { data: usersList, error: listErr } = await supabase.auth.admin.listUsers();
      const existingAuthUser = !listErr
        ? usersList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail)
        : null;

      if (!existingAuthUser) {
        const { error: createAuthErr } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password: desiredPass,
          email_confirm: true,
          user_metadata: {
            require_password_change: true,
            firstName: updatePayload.name || 'Profesional'
          }
        });
        if (!createAuthErr) {
          assignedTempPassword = desiredPass;
        } else {
          console.error('[update-specialist] Error creating Auth user:', createAuthErr);
        }
      } else if (forceReset) {
        const { error: updateAuthErr } = await supabase.auth.admin.updateUserById(existingAuthUser.id, {
          password: desiredPass,
          email_confirm: true,
          user_metadata: {
            ...(existingAuthUser.user_metadata || {}),
            require_password_change: true
          }
        });
        if (!updateAuthErr) {
          assignedTempPassword = desiredPass;
        } else {
          console.error('[update-specialist] Error updating Auth user password:', updateAuthErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated: true,
      specialist: updatedRecord,
      imageUrl: uploadedPublicUrl || updatePayload.image_url || null,
      tempPassword: assignedTempPassword
    });
  } catch (error: any) {
    console.error('[update-specialist] Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
