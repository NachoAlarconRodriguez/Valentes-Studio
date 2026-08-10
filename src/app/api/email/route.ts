import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

async function getAdminRecipients() {
  const adminEmailEnv = process.env.ADMIN_EMAIL;
  const emailsList: { email: string; name: string }[] = [];

  // 1. Agregar administradores definidos en las variables de entorno (separados por coma)
  if (adminEmailEnv) {
    adminEmailEnv.split(',').forEach(emailStr => {
      const email = emailStr.trim();
      if (email.includes('@')) {
        emailsList.push({ email, name: 'Administrador' });
      }
    });
  }

  // 2. Consultar dinámicamente desde la base de datos de Supabase
  try {
    const supabase = await createClient();
    const { data: dbAdmins, error } = await supabase
      .from('specialists')
      .select('email, name')
      .eq('profile_type', 'admin');

    if (error) {
      console.error('Error al consultar administradores en DB:', error);
    } else if (dbAdmins && dbAdmins.length > 0) {
      dbAdmins.forEach((admin: any) => {
        if (!emailsList.some(e => e.email.toLowerCase() === admin.email.toLowerCase())) {
          emailsList.push({ email: admin.email, name: admin.name });
        }
      });
    }
  } catch (err) {
    console.error('Fallo al inicializar Supabase client en API Route:', err);
  }

  // 3. Fallback de respaldo si no se encontró ninguno
  if (emailsList.length === 0) {
    emailsList.push({ email: 'ialarconr.684@gmail.com', name: 'Administrador' });
  }

  return emailsList;
}

interface BrandConfig {
  name: string;
  senderEmail: string;
  domain: string;
  logoUrl: string;
  color: string;
  accentColor: string;
  description: string;
}

const BRAND_CONFIGS: Record<string, BrandConfig> = {
  barberia: {
    name: 'Valentes Barber Studio',
    senderEmail: 'contacto@valentes.cl',
    domain: 'https://www.valentes.cl',
    logoUrl: 'https://www.valentes.cl/hands-logo-v4.png',
    color: '#D48C37', // Dorado Cálido
    accentColor: '#CD7F32',
    description: 'Santuario de Barbería Tradicional'
  },
  peluqueria: {
    name: 'Alma Bela Studio',
    senderEmail: 'contacto@almabela.cl',
    domain: 'https://www.almabela.cl',
    logoUrl: 'https://www.almabela.cl/peluqueria-logo-v6.png',
    color: '#C5A059', // Dorado Brillante
    accentColor: '#CD7F32',
    description: 'Peluquería de Autor'
  },
  terapias: {
    name: 'Jefferson Leonardo Terapias Holísticas',
    senderEmail: 'contacto@jeffersonlopes.cl',
    domain: 'https://www.jeffersonlopes.cl',
    logoUrl: 'https://www.jeffersonlopes.cl/terapias-logo-v11.png',
    color: '#E2E0D8', // Platino/Plata
    accentColor: '#9CA3AF',
    description: 'Terapias Holísticas'
  }
};

const DEFAULT_BRAND: BrandConfig = {
  name: 'Santuario de Bienestar',
  senderEmail: 'contacto@valentes.cl',
  domain: 'https://www.valentes.cl',
  logoUrl: 'https://www.valentes.cl/hands-logo-v4.png',
  color: '#C5A059',
  accentColor: '#CD7F32',
  description: 'Santuario de Bienestar'
};

function getBrand(category: string): BrandConfig {
  return BRAND_CONFIGS[category] || DEFAULT_BRAND;
}

function generateEmailHtml({
  brand,
  title,
  subtitle,
  bodyContentHtml,
  detailsHtml = '',
  buttonText = '',
  buttonUrl = ''
}: {
  brand: BrandConfig;
  title: string;
  subtitle: string;
  bodyContentHtml: string;
  detailsHtml?: string;
  buttonText?: string;
  buttonUrl?: string;
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #070707;
      color: #e5e5e5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #070707;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0a0a0a;
      border: 1px solid #1a1a1a;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.85);
    }
    .header {
      background-color: #000000;
      padding: 40px 20px;
      text-align: center;
      border-bottom: 1px solid #111111;
    }
    .logo {
      height: 70px;
      width: auto;
      margin-bottom: 15px;
      display: inline-block;
    }
    .brand-name {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: ${brand.color};
      text-transform: uppercase;
      margin-top: 5px;
    }
    .brand-desc {
      font-size: 8px;
      letter-spacing: 0.35em;
      color: #888888;
      text-transform: uppercase;
      margin-top: 5px;
    }
    .content {
      padding: 40px 30px;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 8px;
      letter-spacing: 0.02em;
    }
    .subtitle {
      font-size: 11px;
      color: ${brand.color};
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-bottom: 30px;
      font-weight: 600;
    }
    .body-text {
      font-size: 15px;
      line-height: 1.6;
      color: #cccccc;
      margin-bottom: 30px;
    }
    .details-box {
      background-color: #111111;
      border: 1px solid #1f1f1f;
      border-radius: 12px;
      padding: 22px;
      margin-bottom: 30px;
    }
    .details-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: ${brand.color};
      font-weight: 700;
      margin-bottom: 15px;
      border-bottom: 1px solid #1f1f1f;
      pb: 8px;
    }
    .details-row {
      padding: 10px 0;
      border-bottom: 1px solid #1a1a1a;
      display: table;
      width: 100%;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #888888;
      display: table-cell;
      width: 40%;
      text-align: left;
    }
    .details-value {
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      display: table-cell;
      width: 60%;
      text-align: right;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      display: inline-block;
      padding: 15px 36px;
      background-color: ${brand.color};
      color: #000000 !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      border-radius: 50px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    }
    .footer {
      background-color: #000000;
      padding: 30px 20px;
      text-align: center;
      border-top: 1px solid #111111;
      font-size: 11px;
      color: #666666;
      line-height: 1.6;
    }
    .footer-links {
      margin-top: 15px;
    }
    .footer-links a {
      color: #888888;
      text-decoration: none;
      margin: 0 10px;
    }
    .footer-links a:hover {
      color: #ffffff;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img class="logo" src="${brand.logoUrl}" alt="${brand.name} Logo">
        <div class="brand-name">${brand.name}</div>
        <div class="brand-desc">${brand.description}</div>
      </div>
      <div class="content">
        <div class="title">${title}</div>
        <div class="subtitle">${subtitle}</div>
        <div class="body-text">${bodyContentHtml}</div>
        
        ${detailsHtml ? `
        <div class="details-box">
          ${detailsHtml}
        </div>
        ` : ''}

        ${buttonText && buttonUrl ? `
        <div class="btn-container">
          <a class="btn" href="${buttonUrl}">${buttonText}</a>
        </div>
        ` : ''}
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} ${brand.name}. Todos los derechos reservados.
        <br>
        Si tienes dudas o necesitas reagendar, contáctanos directamente.
        <div class="footer-links">
          <a href="${brand.domain}">Sitio Web</a> | 
          <a href="${brand.domain}/contacto">Contacto</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function sendBrevoEmail(payload: {
  sender: { name: string; email: string };
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY no está configurado en .env.local');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en la llamada a Brevo API: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;
    const adminEmail = process.env.ADMIN_EMAIL || 'ialarconr.684@gmail.com';

    if (!type) {
      return NextResponse.json({ error: 'Falta el parámetro "type"' }, { status: 400 });
    }

    // 1. TEST EMAIL FLOW
    if (type === 'test') {
      const targetEmail = data?.email || adminEmail;
      const category = data?.category || 'barberia';
      const brand = getBrand(category);

      const subject = `[Prueba] Confirmación de Ritual - ${brand.name}`;
      const title = 'Tu Ritual ha sido Confirmado';
      const subtitle = brand.description;
      const bodyContentHtml = `<p>Hola, <strong>Ignacio Alarcón</strong>.</p>
      <p>Este es un correo de prueba enviado para verificar la correcta integración de la API de Brevo con el ecosistema de <strong>${brand.name}</strong>.</p>
      <p>A continuación se muestran los detalles simulados de una reserva realizada a través de nuestra plataforma optimizada.</p>`;

      const detailsHtml = `
        <div class="details-title">Detalles de la Cita de Prueba</div>
        <div class="details-row">
          <div class="details-label">Servicio</div>
          <div class="details-value">Corte de Autor & Ritual de Calma</div>
        </div>
        <div class="details-row">
          <div class="details-label">Profesional</div>
          <div class="details-value">Especialista del Santuario</div>
        </div>
        <div class="details-row">
          <div class="details-label">Fecha</div>
          <div class="details-value">Viernes, 10 de Julio, 2026</div>
        </div>
        <div class="details-row">
          <div class="details-label">Hora</div>
          <div class="details-value">16:30 hrs</div>
        </div>
        <div class="details-row">
          <div class="details-label">Código de Reserva</div>
          <div class="details-value">TST-991204</div>
        </div>
        <div class="details-row">
          <div class="details-label">Valor</div>
          <div class="details-value">$25.000</div>
        </div>
      `;

      const htmlContent = generateEmailHtml({
        brand,
        title,
        subtitle,
        bodyContentHtml,
        detailsHtml,
        buttonText: 'Ir a mi Panel de Reserva',
        buttonUrl: `${brand.domain}/reservas/TST-991204`
      });

      const res = await sendBrevoEmail({
        sender: brand.senderEmail ? { name: brand.name, email: brand.senderEmail } : { name: DEFAULT_BRAND.name, email: DEFAULT_BRAND.senderEmail },
        to: [{ email: targetEmail, name: 'Ignacio Alarcón' }],
        subject,
        htmlContent
      });

      return NextResponse.json({ success: true, message: `Correo de prueba enviado a ${targetEmail} usando la marca ${brand.name}`, brevoResponse: res });
    }

    // 2. BOOKING CONFIRMATION FLOW
    if (type === 'booking_confirmation') {
      const { id, clientName, clientEmail, category, serviceName, price, specialistName, date, time } = data;
      const brand = getBrand(category);

      const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const clientSubject = `Confirmación de Reserva: ${serviceName} - ${brand.name}`;
      const clientHtml = generateEmailHtml({
        brand,
        title: 'Tu Ritual está Confirmado',
        subtitle: brand.description,
        bodyContentHtml: `<p>Hola, <strong>${clientName}</strong>.</p>
        <p>Tu ritual en <strong>${brand.name}</strong> ha sido agendado exitosamente. Te esperamos en la fecha y hora seleccionadas para ofrecerte un momento único de bienestar.</p>
        <p>Si deseas realizar cambios o cancelar tu cita, por favor contáctanos directamente a nuestro canal de WhatsApp correspondiente.</p>`,
        detailsHtml: `
          <div class="details-title">Resumen de tu Ritual</div>
          <div class="details-row">
            <div class="details-label">Código de Reserva</div>
            <div class="details-value">${id}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Servicio</div>
            <div class="details-value">${serviceName}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Especialista</div>
            <div class="details-value">${specialistName}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Fecha</div>
            <div class="details-value" style="text-transform: capitalize;">${formattedDate}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Hora</div>
            <div class="details-value">${time} hrs</div>
          </div>
          <div class="details-row">
            <div class="details-label">Valor</div>
            <div class="details-value">${price}</div>
          </div>
        `
      });

      // Send to Client (if email is provided)
      let clientRes = null;
      if (clientEmail && clientEmail.includes('@')) {
        clientRes = await sendBrevoEmail({
          sender: { name: brand.name, email: brand.senderEmail },
          to: [{ email: clientEmail, name: clientName }],
          subject: clientSubject,
          htmlContent: clientHtml
        });
      }

      // Send to Administrator & Staff member
      let staffEmail = data.specialistEmail || adminEmail;
      const staffSubject = `Nueva Reserva Asignada: ${clientName} - ${brand.name}`;
      const staffHtml = generateEmailHtml({
        brand,
        title: 'Nueva Reserva Asignada',
        subtitle: 'Notificación de Agenda',
        bodyContentHtml: `<p>Hola.</p>
        <p>Se ha registrado un nuevo agendamiento en el sistema para <strong>${specialistName}</strong>.</p>
        <p>Por favor, revisa tu agenda para preparar el servicio correspondiente.</p>`,
        detailsHtml: `
          <div class="details-title">Datos de la Reserva</div>
          <div class="details-row">
            <div class="details-label">Cliente</div>
            <div class="details-value">${clientName}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Teléfono Cliente</div>
            <div class="details-value">${data.clientPhone || 'No registrado'}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Servicio</div>
            <div class="details-value">${serviceName}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Fecha</div>
            <div class="details-value" style="text-transform: capitalize;">${formattedDate}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Hora</div>
            <div class="details-value">${time} hrs</div>
          </div>
          <div class="details-row">
            <div class="details-label">Código</div>
            <div class="details-value">${id}</div>
          </div>
        `,
        buttonText: 'Ver Panel de Administración',
        buttonUrl: `${brand.domain}/admin`
      });

      // Send alert to admins
      const adminRecipients = await getAdminRecipients();
      await sendBrevoEmail({
        sender: { name: brand.name, email: brand.senderEmail },
        to: adminRecipients,
        subject: staffSubject,
        htmlContent: staffHtml
      });

      // Send alert to staff (if specialist has an email and is not already in the admin list)
      const isStaffInAdminList = adminRecipients.some(admin => admin.email.toLowerCase() === staffEmail.toLowerCase());
      if (staffEmail && !isStaffInAdminList && staffEmail.includes('@')) {
        await sendBrevoEmail({
          sender: { name: brand.name, email: brand.senderEmail },
          to: [{ email: staffEmail, name: specialistName }],
          subject: staffSubject,
          htmlContent: staffHtml
        });
      }

      return NextResponse.json({ success: true, clientEmailSent: !!clientEmail, clientRes });
    }

    // 3. BOOKING CANCELLATION FLOW
    if (type === 'booking_cancelled') {
      const { id, clientName, clientEmail, category, serviceName, date, time, specialistName } = data;
      const brand = getBrand(category);

      const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const clientSubject = `Reserva Cancelada: ${serviceName} - ${brand.name}`;
      const clientHtml = generateEmailHtml({
        brand,
        title: 'Tu Reserva ha sido Cancelada',
        subtitle: brand.description,
        bodyContentHtml: `<p>Hola, <strong>${clientName}</strong>.</p>
        <p>Te confirmamos que tu reserva con código <strong>${id}</strong> ha sido cancelada exitosamente.</p>
        <p>Si esto fue un error o deseas programar un nuevo ritual en el futuro, puedes acceder a nuestro sitio web en cualquier momento.</p>`,
        detailsHtml: `
          <div class="details-title">Detalles de la Reserva Cancelada</div>
          <div class="details-row">
            <div class="details-label">Servicio</div>
            <div class="details-value">${serviceName}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Especialista</div>
            <div class="details-value">${specialistName}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Fecha original</div>
            <div class="details-value" style="text-transform: capitalize;">${formattedDate}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Hora original</div>
            <div class="details-value">${time} hrs</div>
          </div>
        `,
        buttonText: 'Agendar nuevo Ritual',
        buttonUrl: brand.domain
      });

      // Send to Client (if email is provided)
      let clientRes = null;
      if (clientEmail && clientEmail.includes('@')) {
        clientRes = await sendBrevoEmail({
          sender: { name: brand.name, email: brand.senderEmail },
          to: [{ email: clientEmail, name: clientName }],
          subject: clientSubject,
          htmlContent: clientHtml
        });
      }

      // Send alert to admin & staff
      const staffEmail = data.specialistEmail || adminEmail;
      const staffSubject = `Alerta: Reserva Cancelada - ${clientName}`;
      const staffHtml = generateEmailHtml({
        brand,
        title: 'Reserva Cancelada por el Cliente',
        subtitle: 'Alerta de Cambio de Agenda',
        bodyContentHtml: `<p>Hola.</p>
        <p>Se ha cancelado la siguiente cita asignada a <strong>${specialistName}</strong>. Este espacio ya se encuentra disponible para nuevas reservas.</p>`,
        detailsHtml: `
          <div class="details-title">Cita Cancelada</div>
          <div class="details-row">
            <div class="details-label">Cliente</div>
            <div class="details-value">${clientName}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Servicio</div>
            <div class="details-value">${serviceName}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Fecha original</div>
            <div class="details-value" style="text-transform: capitalize;">${formattedDate}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Hora original</div>
            <div class="details-value">${time} hrs</div>
          </div>
          <div class="details-row">
            <div class="details-label">Código</div>
            <div class="details-value">${id}</div>
          </div>
        `,
        buttonText: 'Ver Panel de Administración',
        buttonUrl: `${brand.domain}/admin`
      });

      // Notify admins
      const adminRecipients = await getAdminRecipients();
      await sendBrevoEmail({
        sender: { name: brand.name, email: brand.senderEmail },
        to: adminRecipients,
        subject: staffSubject,
        htmlContent: staffHtml
      });

      // Notify staff (if specialist has an email and is not already in the admin list)
      const isStaffInAdminList = adminRecipients.some(admin => admin.email.toLowerCase() === staffEmail.toLowerCase());
      if (staffEmail && !isStaffInAdminList && staffEmail.includes('@')) {
        await sendBrevoEmail({
          sender: { name: brand.name, email: brand.senderEmail },
          to: [{ email: staffEmail, name: specialistName }],
          subject: staffSubject,
          htmlContent: staffHtml
        });
      }

      return NextResponse.json({ success: true, clientEmailSent: !!clientEmail });
    }

    // 4. GIFTCARD PURCHASE FLOW
    if (type === 'giftcard_purchase') {
      const { code, originalAmount, senderName, senderEmail, recipientName, recipientEmail, theme, message, expiresAt } = data;
      const brand = getBrand(theme); // Use theme as the category mapping

      const formattedExpires = new Date(expiresAt).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const recipientSubject = `¡Has recibido una Tarjeta de Regalo! - ${brand.name}`;
      const recipientHtml = generateEmailHtml({
        brand,
        title: '¡Te han regalado una experiencia de Bienestar!',
        subtitle: brand.description,
        bodyContentHtml: `<p>Hola, <strong>${recipientName}</strong>.</p>
        <p><strong>${senderName}</strong> te ha regalado una Gift Card electrónica para disfrutar de un ritual exclusivo en <strong>${brand.name}</strong>.</p>
        ${message ? `<p style="font-style: italic; background-color: #111; border-left: 3px solid ${brand.color}; padding: 15px; border-radius: 4px; color: #fff;">"${message}"</p>` : ''}
        <p>Para canjearla, simplemente ingresa el código de regalo al momento de agendar tu ritual en nuestro sitio web o muéstralo al visitarnos.</p>`,
        detailsHtml: `
          <div class="details-title">Tu Tarjeta de Regalo Digital</div>
          <div class="details-row">
            <div class="details-label">Código de Canje</div>
            <div class="details-value" style="font-family: monospace; font-size: 15px; color: ${brand.color};">${code}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Monto de Regalo</div>
            <div class="details-value">$${originalAmount.toLocaleString('es-CL')}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Válida hasta</div>
            <div class="details-value">${formattedExpires}</div>
          </div>
        `,
        buttonText: 'Reservar mi Ritual Ahora',
        buttonUrl: brand.domain
      });

      // Send to Recipient
      let recipientRes = null;
      if (recipientEmail && recipientEmail.includes('@')) {
        recipientRes = await sendBrevoEmail({
          sender: { name: brand.name, email: brand.senderEmail },
          to: [{ email: recipientEmail, name: recipientName }],
          subject: recipientSubject,
          htmlContent: recipientHtml
        });
      }

      // Send Confirmation Receipt to Sender
      const senderSubject = `Tu Gift Card para ${recipientName} ha sido entregada - ${brand.name}`;
      const senderHtml = generateEmailHtml({
        brand,
        title: 'Tu Regalo ha sido Enviado',
        subtitle: 'Confirmación de Compra',
        bodyContentHtml: `<p>Hola, <strong>${senderName}</strong>.</p>
        <p>Queremos confirmarte que tu Gift Card digital de **$${originalAmount.toLocaleString('es-CL')}** para <strong>${recipientName}</strong> ha sido enviada con éxito a su casilla de correo electrónico (<strong>${recipientEmail}</strong>).</p>
        <p>Adjuntamos el comprobante de los detalles de la tarjeta de regalo.</p>`,
        detailsHtml: `
          <div class="details-title">Resumen de la Compra</div>
          <div class="details-row">
            <div class="details-label">Código de la Gift Card</div>
            <div class="details-value">${code}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Monto Cargado</div>
            <div class="details-value">$${originalAmount.toLocaleString('es-CL')}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Destinatario</div>
            <div class="details-value">${recipientName} (${recipientEmail})</div>
          </div>
        `,
        buttonText: 'Comprar otra Gift Card',
        buttonUrl: `${brand.domain}/giftcards`
      });

      if (senderEmail && senderEmail.includes('@')) {
        await sendBrevoEmail({
          sender: { name: brand.name, email: brand.senderEmail },
          to: [{ email: senderEmail, name: senderName }],
          subject: senderSubject,
          htmlContent: senderHtml
        });
      }

      return NextResponse.json({ success: true, recipientRes });
    }

    // 5. DAILY AGENDA SUMMARY FOR ADMIN & INDIVIDUAL STAFF
    if (type === 'daily_agenda') {
      const { email, recipientName, isSummary, date, appointments } = data;
      // We use DEFAULT_BRAND configuration for the daily agenda consolidation (Santuario de Bienestar)
      const brand = DEFAULT_BRAND;

      const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const subject = isSummary 
        ? `[Resumen General] Agenda del Día: ${formattedDate}` 
        : `Tu Agenda del Día: ${formattedDate} - ${recipientName}`;

      let bodyContentHtml = '';
      if (isSummary) {
        bodyContentHtml = `<p>Hola, <strong>Administrador</strong>.</p>
        <p>A continuación se muestra el movimiento general consolidado para hoy, <strong>${formattedDate}</strong>. Contamos con un total de <strong>${appointments.length} reservas</strong> programadas.</p>`;
      } else {
        bodyContentHtml = `<p>Hola, <strong>${recipientName}</strong>.</p>
        <p>Aquí tienes la lista cronológica de tus citas agendadas para hoy, <strong>${formattedDate}</strong>. ¡Que tengas una excelente jornada!</p>`;
      }

      let appointmentsHtml = appointments.length === 0 
        ? '<p style="color:#888; font-style:italic;">No hay citas registradas para el día de hoy.</p>'
        : appointments.map((appt: any, idx: number) => {
            const apptBrand = getBrand(appt.category);
            return `
              <div style="background-color: #161616; padding: 15px; border-radius: 8px; margin-bottom: 12px; border-left: 3px solid ${apptBrand.color};">
                <span style="font-weight: bold; font-size: 14px; color: #fff;">${appt.time} hrs</span> - 
                <span style="color:${apptBrand.color}; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">${apptBrand.name}</span>
                <div style="font-size: 13px; margin-top: 5px; color: #ccc;">
                  <strong>Cliente:</strong> ${appt.clientName} (${appt.clientPhone})<br>
                  <strong>Servicio:</strong> ${appt.serviceName}<br>
                  ${isSummary ? `<strong>Especialista:</strong> ${appt.specialistName}` : ''}
                </div>
              </div>
            `;
          }).join('');

      const htmlContent = generateEmailHtml({
        brand,
        title: isSummary ? 'Resumen de Ocupación' : 'Tu Agenda Diaria',
        subtitle: formattedDate,
        bodyContentHtml,
        detailsHtml: `
          <div class="details-title">Cronograma de Reservas</div>
          <div style="padding-top: 5px;">
            ${appointmentsHtml}
          </div>
        `,
        buttonText: 'Ver Calendario en Vivo',
        buttonUrl: `${brand.domain}/admin`
      });

      const res = await sendBrevoEmail({
        sender: { name: brand.name, email: brand.senderEmail },
        to: [{ email, name: recipientName }],
        subject,
        htmlContent
      });

      return NextResponse.json({ success: true, res });
    }

    // 6. PASSWORD RESET FLOW
    if (type === 'password_reset') {
      const { email, resetLink } = data;
      const brand = DEFAULT_BRAND;

      const subject = `Recuperación de Contraseña - ${brand.name}`;
      const title = 'Restablecer tu Contraseña';
      const subtitle = 'Consola de Control';
      const bodyContentHtml = `<p>Hola.</p>
      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de acceso a la Consola de Control de <strong>${brand.name}</strong>.</p>
      <p>Si no realizaste esta solicitud, puedes ignorar este correo de forma segura. Tu contraseña actual seguirá siendo válida.</p>
      <p>Para restablecer tu contraseña, haz clic en el botón a continuación. Este enlace expira en 24 horas.</p>`;

      const htmlContent = generateEmailHtml({
        brand,
        title,
        subtitle,
        bodyContentHtml,
        buttonText: 'Restablecer Contraseña',
        buttonUrl: resetLink
      });

      const res = await sendBrevoEmail({
        sender: { name: brand.name, email: brand.senderEmail },
        to: [{ email: email }],
        subject,
        htmlContent
      });

      return NextResponse.json({ success: true, res });
    }

    return NextResponse.json({ error: 'Tipo de correo no soportado' }, { status: 400 });

  } catch (error: any) {
    console.error('Error procesando email API:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
