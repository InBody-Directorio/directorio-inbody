/**
 * POST /api/registro
 *
 * Recibe la solicitud de registro de un profesional, valida datos,
 * verifica duplicados, aplica rate limiting y manda 2 correos:
 *   1. Notificación al equipo InBody (directorioinbody@gmail.com)
 *   2. Confirmación al doctor
 *
 * NOTA: La inserción a Supabase (incluidas fotos) la hace el frontend ANTES de llamar
 * a este endpoint. Aquí solo nos encargamos de los correos transaccionales y validaciones.
 */

import { Resend } from 'resend';

const TO_EMAIL_TEAM = process.env.RESEND_TO_EMAIL || 'directorioinbody@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'InBody Directorio <directorio@marketinglab.mx>';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // === Validaciones server-side básicas ===
    const required = ['nombre', 'especialidad', 'email', 'telefono', 'whatsapp', 'modelo_inbody', 'ubicaciones'];
    for (const field of required) {
      if (!data[field]) {
        return res.status(400).json({ error: `Falta el campo: ${field}` });
      }
    }

    if (!Array.isArray(data.ubicaciones) || data.ubicaciones.length === 0) {
      return res.status(400).json({ error: 'Necesita al menos una ubicación' });
    }
    if (data.ubicaciones.length > 3) {
      return res.status(400).json({ error: 'Máximo 3 ubicaciones por registro' });
    }

    // Honeypot anti-spam
    if (data.honeypot && data.honeypot.length > 0) {
      // Bot detectado: respondemos "ok" pero no hacemos nada
      return res.status(200).json({ ok: true, message: 'OK' });
    }

    if (!data.consentimiento_privacidad) {
      return res.status(400).json({ error: 'Debes aceptar el aviso de privacidad' });
    }

    // Validar email
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(data.email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validar WhatsApp México (10 dígitos)
    const cleanWA = (data.whatsapp || '').replace(/\D/g, '');
    if (cleanWA.length !== 10 && cleanWA.length !== 12) {
      return res.status(400).json({ error: 'WhatsApp debe tener 10 dígitos (México)' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // === Correo 1: al equipo InBody ===
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL_TEAM,
      subject: 'Nueva solicitud de registro · Directorio InBody',
      html: renderTeamEmail(data),
    });

    // === Correo 2: confirmación al doctor ===
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: 'Recibimos tu solicitud · Directorio InBody México',
      html: renderDoctorEmail(data),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error en /api/registro:', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
}

// ============================================================
// PLANTILLAS DE CORREO
// ============================================================

function renderTeamEmail(data) {
  const ubicaciones = (data.ubicaciones || [])
    .map(function (u, i) {
      return `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:13px;color:#5c5c60;">
            <strong style="color:#18181a;">Ubicación ${i + 1}:</strong> ${escapeHTML(u.direccion_completa || '')}, ${escapeHTML(u.ciudad || '')}, ${escapeHTML(u.estado || '')}
            ${u.codigo_postal ? '<br/><span style="font-size:11px;">CP ' + escapeHTML(u.codigo_postal) + '</span>' : ''}
            ${(u.lat && u.lng) ? '<br/><span style="font-size:11px;color:#1d9e75;">✓ Geocodificada</span>' : '<br/><span style="font-size:11px;color:#d85a30;">⚠ Sin geocodificar (revisar manualmente)</span>'}
          </td>
        </tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><title>Nueva solicitud</title></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
        <tr><td style="background:#E31937;padding:24px 32px;">
          <div style="color:white;font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;opacity:0.9;">Directorio InBody · México</div>
          <div style="color:white;font-size:22px;font-weight:600;margin-top:8px;">Nueva solicitud de registro</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 24px;font-size:14px;color:#5c5c60;line-height:1.6;">
            Hola equipo, llegó una nueva solicitud de registro al directorio. Revisen los datos y aprueben o rechacen desde el panel admin.
          </p>

          <div style="background:#fafaf7;border-radius:12px;padding:20px;margin-bottom:16px;">
            <div style="font-size:11px;font-weight:600;color:#E31937;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Profesional</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
              <tr><td style="padding:6px 0;color:#5c5c60;width:140px;">Nombre:</td><td style="padding:6px 0;color:#18181a;font-weight:500;">${escapeHTML(data.nombre)}</td></tr>
              <tr><td style="padding:6px 0;color:#5c5c60;">Especialidad:</td><td style="padding:6px 0;color:#18181a;">${escapeHTML(data.especialidad_label || data.especialidad)}</td></tr>
              <tr><td style="padding:6px 0;color:#5c5c60;">Modelo InBody:</td><td style="padding:6px 0;color:#18181a;">${escapeHTML(data.modelo_inbody_label || data.modelo_inbody)}</td></tr>
              ${data.descripcion_breve ? `<tr><td style="padding:6px 0;color:#5c5c60;vertical-align:top;">Descripción:</td><td style="padding:6px 0;color:#18181a;line-height:1.5;">${escapeHTML(data.descripcion_breve)}</td></tr>` : ''}
            </table>
          </div>

          <div style="background:#fafaf7;border-radius:12px;padding:20px;margin-bottom:16px;">
            <div style="font-size:11px;font-weight:600;color:#E31937;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Contacto</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
              <tr><td style="padding:6px 0;color:#5c5c60;width:140px;">WhatsApp:</td><td style="padding:6px 0;color:#18181a;">${formatPhone(data.whatsapp)}</td></tr>
              <tr><td style="padding:6px 0;color:#5c5c60;">Teléfono:</td><td style="padding:6px 0;color:#18181a;">${formatPhone(data.telefono)}</td></tr>
              <tr><td style="padding:6px 0;color:#5c5c60;">Email:</td><td style="padding:6px 0;color:#18181a;">${escapeHTML(data.email)}</td></tr>
              ${data.sitio_web ? `<tr><td style="padding:6px 0;color:#5c5c60;">Web:</td><td style="padding:6px 0;color:#18181a;">${escapeHTML(data.sitio_web)}</td></tr>` : ''}
              ${data.instagram ? `<tr><td style="padding:6px 0;color:#5c5c60;">Instagram:</td><td style="padding:6px 0;color:#18181a;">${escapeHTML(data.instagram)}</td></tr>` : ''}
              ${data.facebook ? `<tr><td style="padding:6px 0;color:#5c5c60;">Facebook:</td><td style="padding:6px 0;color:#18181a;">${escapeHTML(data.facebook)}</td></tr>` : ''}
            </table>
          </div>

          <div style="background:#fafaf7;border-radius:12px;padding:20px;margin-bottom:16px;">
            <div style="font-size:11px;font-weight:600;color:#E31937;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Ubicaciones (${data.ubicaciones.length})</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${ubicaciones}
            </table>
          </div>

          ${data.foto_perfil_url || data.foto_equipo_url ? `
          <div style="background:#fafaf7;border-radius:12px;padding:20px;margin-bottom:24px;">
            <div style="font-size:11px;font-weight:600;color:#E31937;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Fotos</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${data.foto_perfil_url ? `<td style="width:50%;padding-right:8px;"><img src="${data.foto_perfil_url}" style="width:100%;border-radius:8px;display:block;" alt="Foto perfil" /><div style="font-size:11px;color:#5c5c60;text-align:center;margin-top:6px;">Foto de perfil</div></td>` : ''}
                ${data.foto_equipo_url ? `<td style="width:50%;padding-left:8px;"><img src="${data.foto_equipo_url}" style="width:100%;border-radius:8px;display:block;" alt="Foto equipo" /><div style="font-size:11px;color:#5c5c60;text-align:center;margin-top:6px;">Foto del equipo InBody</div></td>` : ''}
              </tr>
            </table>
          </div>` : ''}

          <p style="margin:24px 0 0;font-size:12px;color:#8a8a8f;line-height:1.6;">
            La solicitud quedó registrada en Supabase con estado <strong>pendiente</strong>. Para aprobarla o rechazarla, accedan al panel administrativo.
          </p>
        </td></tr>
        <tr><td style="background:#fafaf7;padding:16px 32px;text-align:center;border-top:1px solid #ececea;">
          <div style="font-size:11px;color:#8a8a8f;">Directorio InBody México</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
}

function renderDoctorEmail(data) {
  const ubicacionesText = (data.ubicaciones || [])
    .map(function (u, i) {
      return `
        <tr><td style="padding:4px 0;font-size:13px;color:#5c5c60;">
          <strong style="color:#18181a;">${i === 0 ? 'Ubicación principal' : 'Ubicación ' + (i + 1)}:</strong><br/>
          ${escapeHTML(u.direccion_completa || '')}<br/>
          ${escapeHTML(u.ciudad || '')}, ${escapeHTML(u.estado || '')}
        </td></tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><title>Recibimos tu solicitud</title></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
        <tr><td style="background:#E31937;padding:32px;">
          <div style="color:white;font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;opacity:0.9;">Directorio InBody · México</div>
          <div style="color:white;font-size:24px;font-weight:600;margin-top:8px;line-height:1.3;">Recibimos tu solicitud</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:15px;color:#18181a;line-height:1.6;">
            Hola <strong>${escapeHTML(data.nombre)}</strong>,
          </p>
          <p style="margin:0 0 24px;font-size:14px;color:#5c5c60;line-height:1.7;">
            Gracias por solicitar tu registro en el Directorio Oficial de InBody México. Recibimos correctamente tu información y la guardamos en nuestro sistema.
          </p>

          <div style="background:#fafaf7;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:3px solid #E31937;">
            <div style="font-size:11px;font-weight:600;color:#E31937;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">Siguiente paso</div>
            <div style="font-size:14px;color:#18181a;line-height:1.6;">
              En las próximas <strong>3 a 5 días hábiles</strong> el equipo de InBody México revisará tu información y te contactaremos por este correo cuando esté aprobada.
            </div>
          </div>

          <div style="margin-bottom:24px;">
            <div style="font-size:11px;font-weight:600;color:#8a8a8f;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Resumen de tu solicitud</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;border:1px solid #ececea;border-radius:10px;">
              <tr><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#5c5c60;width:130px;">Nombre:</td><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#18181a;font-weight:500;">${escapeHTML(data.nombre)}</td></tr>
              <tr><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#5c5c60;">Especialidad:</td><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#18181a;">${escapeHTML(data.especialidad_label || data.especialidad)}</td></tr>
              <tr><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#5c5c60;">Modelo InBody:</td><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#18181a;">${escapeHTML(data.modelo_inbody_label || data.modelo_inbody)}</td></tr>
              <tr><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#5c5c60;">WhatsApp:</td><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#18181a;">${formatPhone(data.whatsapp)}</td></tr>
              <tr><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#5c5c60;">Teléfono:</td><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#18181a;">${formatPhone(data.telefono)}</td></tr>
              <tr><td style="padding:12px 16px;color:#5c5c60;vertical-align:top;">Ubicaciones:</td><td style="padding:8px 16px;"><table width="100%" cellpadding="0" cellspacing="0">${ubicacionesText}</table></td></tr>
            </table>
          </div>

          <div style="background:#fff7f8;border-radius:10px;padding:16px;margin-bottom:24px;">
            <div style="font-size:12px;color:#5c5c60;line-height:1.6;">
              <strong style="color:#a32d2d;">¿Hay algún error en tus datos?</strong> Por favor envía una nueva solicitud con la información correcta. Descartaremos la anterior al recibir la nueva.
            </div>
          </div>

          <p style="margin:0;font-size:13px;color:#8a8a8f;line-height:1.6;">
            Si tienes dudas, puedes responder directamente a este correo.<br/>
            <strong style="color:#18181a;">Equipo InBody México</strong>
          </p>
        </td></tr>
        <tr><td style="background:#18181a;padding:20px 32px;text-align:center;">
          <div style="font-size:11px;color:#8a8a8f;line-height:1.6;">
            © ${new Date().getFullYear()} InBody México<br/>
            <a href="https://www.inbodymexico.com" style="color:#5c5c60;text-decoration:none;">inbodymexico.com</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
}

// ============================================================
// HELPERS
// ============================================================

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPhone(phone) {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return '+52 ' + clean.slice(0, 2) + ' ' + clean.slice(2, 6) + ' ' + clean.slice(6);
  }
  if (clean.length === 12 && clean.startsWith('52')) {
    return '+52 ' + clean.slice(2, 4) + ' ' + clean.slice(4, 8) + ' ' + clean.slice(8);
  }
  return phone;
}
