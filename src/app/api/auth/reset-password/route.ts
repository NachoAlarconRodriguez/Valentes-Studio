import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'El correo electrónico es requerido.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Las variables de entorno de Supabase no están configuradas correctamente.' },
        { status: 500 }
      );
    }

    // 1. Initialize Supabase Admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const origin = req.headers.get('origin') || new URL(req.url).origin;

    // 2. Generate the recovery link using Supabase Admin Auth API
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim(),
      options: {
        redirectTo: `${origin}/admin`
      }
    });

    if (linkError) {
      console.error('Error al generar link de recuperación:', linkError);
      return NextResponse.json(
        { error: `No se pudo generar el enlace: ${linkError.message}` },
        { status: 400 }
      );
    }

    const actionLink = linkData?.properties?.action_link;

    if (!actionLink) {
      return NextResponse.json(
        { error: 'No se pudo obtener el enlace de acción desde el servidor.' },
        { status: 500 }
      );
    }

    // 3. Call our custom email API internally to send the styled email via Brevo
    const emailResponse = await fetch(`${origin}/api/email`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        type: 'password_reset',
        data: {
          email: email.trim(),
          resetLink: actionLink
        }
      })
    });

    if (!emailResponse.ok) {
      const emailErrorData = await emailResponse.json().catch(() => ({}));
      throw new Error(emailErrorData.error || 'Error al enviar el correo con Brevo');
    }

    return NextResponse.json({ success: true, message: 'Enlace de recuperación enviado con éxito.' });
  } catch (error: any) {
    console.error('Error en reset-password endpoint:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
