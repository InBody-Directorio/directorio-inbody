/**
 * POST /api/registro
 *
 * Maneja todo el flujo de creación de un profesional.
 * Usa SERVICE_ROLE para bypassar RLS de forma segura.
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const TO_EMAIL_TEAM = process.env.RESEND_TO_EMAIL || 'directorioinbody@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'InBody Directorio <directorio@marketinglab.mx>';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    const required = ['nombre', 'especialidad', 'email', 'telefono', 'whatsapp', 'modelo_inbody', 'numero_serie', 'ubicaciones'];
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

    if (data.honeypot && data.honeypot.length > 0) {
      return res.status(200).json({ ok: true, message: 'OK' });
    }

    if (!data.consentimiento_privacidad) {
      return res.status(400).json({ error: 'Debes aceptar el aviso de privacidad' });
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(data.email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const cleanWA = (data.whatsapp || '').replace(/\D/g, '');
    if (cleanWA.length !== 10 && cleanWA.length !== 12) {
      return res.status(400).json({ error: 'WhatsApp debe tener 10 dígitos (México)' });
    }

    if (!data.numero_serie || String(data.numero_serie).trim().length < 4) {
      return res.status(400).json({ error: 'Número de serie obligatorio (mínimo 4 caracteres)' });
    }

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: existing } = await supabaseAdmin
      .from('profesionales')
      .select('id')
      .ilike('email', data.email)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({
        error: 'Ya existe una solicitud con este correo. Si necesitas corregir información, espera a que el equipo te contacte.',
      });
    }

    const { data: profesional, error: profError } = await supabaseAdmin
      .from('profesionales')
      .insert({
        nombre: data.nombre,
        especialidad: data.especialidad,
        descripcion_breve: data.descripcion_breve || null,
        foto_perfil_url: data.foto_perfil_url || null,
        foto_equipo_url: data.foto_equipo_url || null,
        email: data.email,
        telefono: data.telefono,
        whatsapp: data.whatsapp,
        sitio_web: data.sitio_web || null,
        instagram: data.instagram || null,
        facebook: data.facebook || null,
        modelo_inbody: data.modelo_inbody,
        numero_serie: String(data.numero_serie).trim().toUpperCase(),
        consentimiento_privacidad: true,
        status: 'pendiente',
      })
      .select('id')
      .single();

    if (profError) {
      console.error('Error creando profesional:', profError);
      return res.status(500).json({ error: 'Error al crear el registro: ' + profError.message });
    }

    const ubicacionesPayload = data.ubicaciones.map(function (u, idx) {
      return {
        profesional_id: profesional.id,
        direccion_completa: u.direccion_completa,
        ciudad: u.ciudad,
        estado: u.estado,
        codigo_postal: u.codigo_postal || null,
        lat: u.lat || null,
        lng: u.lng || null,
        es_principal: idx === 0,
        activa: true,
      };
    });

    const { error: ubicError } = await supabaseAdmin
      .from('ubicaciones')
      .insert(ubicacionesPayload);

    if (ubicError) {
      console.error('Error creando ubicaciones:', ubicError);
      await supabaseAdmin.from('profesionales').delete().eq('id', profesional.id);
      return res.status(500).json({ error: 'Error al guardar ubicaciones: ' + ubicError.message });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'directorio-inbody.vercel.app';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const adminUrl = `${protocol}://${host}/inbody-admin/pendientes`;

    // Correos en background (no bloquean respuesta)
    Promise.race([
      Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: TO_EMAIL_TEAM,
          subject: `Nueva solicitud: ${data.nombre} · Directorio InBody`,
          html: renderTeamEmail({ ...data, admin_url: adminUrl, profesional_id: profesional.id }),
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: data.email,
          subject: 'Recibimos tu solicitud · Directorio InBody México',
          html: renderDoctorEmail(data),
        }),
      ]),
      new Promise(function (_, reject) { setTimeout(reject, 9000); }),
    ]).catch(function (err) {
      console.error('Error/timeout enviando correos:', err);
    });

    return res.status(200).json({ ok: true, id: profesional.id });
  } catch (err) {
    console.error('Error en /api/registro:', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
}

function renderTeamEmail(data) {
  const ubicaciones = (data.ubicaciones || []).map(function (u, i) {
    return `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:13px;color:#5c5c60;">
      <strong style="color:#18181a;">Ubicación ${i + 1}:</strong> ${escapeHTML(u.direccion_completa || '')}, ${escapeHTML(u.ciudad || '')}, ${escapeHTML(u.estado || '')}
      ${u.codigo_postal ? '<br/><span style="font-size:11px;">CP ' + escapeHTML(u.codigo_postal) + '</span>' : ''}
      ${(u.lat && u.lng) ? '<br/><span style="font-size:11px;color:#1d9e75;">✓ Geocodificada</span>' : '<br/><span style="font-size:11px;color:#d85a30;">⚠ Sin geocodificar (revisar manualmente)</span>'}
    </td></tr>`;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
<tr><td style="background:#971B2F;padding:24px 32px;">
  <div style="color:white;font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;opacity:0.9;">Directorio InBody · México</div>
  <div style="color:white;font-size:22px;font-weight:600;margin-top:8px;">Nueva solicitud de registro</div>
</td></tr>
<tr><td style="padding:32px;">
  <p style="margin:0 0 24px;font-size:14px;color:#5c5c60;line-height:1.6;">
    Llegó una nueva solicitud de registro al directorio. Revisen los datos y aprueben o rechacen desde el panel.
  </p>
  <div style="background:#fafaf7;border-radius:12px;padding:20px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:600;color:#971B2F;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Profesional</div>
    <table width="100%" style="font-size:13px;">
      <tr><td style="padding:6px 0;color:#5c5c60;width:140px;">Nombre:</td><td style="padding:6px 0;color:#18181a;font-weight:500;">${escapeHTML(data.nombre)}</td></tr>
      <tr><td style="padding:6px 0;color:#5c5c60;">Categoría:</td><td style="padding:6px 0;color:#18181a;">${escapeHTML(data.especialidad_label || data.especialidad)}</td></tr>
      <tr><td style="padding:6px 0;color:#5c5c60;">Modelo InBody:</td><td style="padding:6px 0;color:#18181a;">${escapeHTML(data.modelo_inbody_label || data.modelo_inbody)}</td></tr>
      <tr><td style="padding:6px 0;color:#5c5c60;">Núm. serie:</td><td style="padding:6px 0;color:#18181a;font-family:Menlo,monospace;font-weight:600;">${escapeHTML(data.numero_serie || '—')}</td></tr>
      ${data.descripcion_breve ? `<tr><td style="padding:6px 0;color:#5c5c60;vertical-align:top;">Descripción:</td><td style="padding:6px 0;color:#18181a;line-height:1.5;">${escapeHTML(data.descripcion_breve)}</td></tr>` : ''}
    </table>
  </div>
  <div style="background:#fafaf7;border-radius:12px;padding:20px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:600;color:#971B2F;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Contacto</div>
    <table width="100%" style="font-size:13px;">
      <tr><td style="padding:6px 0;color:#5c5c60;width:140px;">WhatsApp:</td><td style="padding:6px 0;color:#18181a;">${formatPhone(data.whatsapp)}</td></tr>
      <tr><td style="padding:6px 0;color:#5c5c60;">Teléfono:</td><td style="padding:6px 0;color:#18181a;">${formatPhone(data.telefono)}</td></tr>
      <tr><td style="padding:6px 0;color:#5c5c60;">Email:</td><td style="padding:6px 0;color:#18181a;">${escapeHTML(data.email)}</td></tr>
      ${data.sitio_web ? `<tr><td style="padding:6px 0;color:#5c5c60;">Web:</td><td style="padding:6px 0;color:#18181a;">${escapeHTML(data.sitio_web)}</td></tr>` : ''}
    </table>
  </div>
  <div style="background:#fafaf7;border-radius:12px;padding:20px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:600;color:#971B2F;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Ubicaciones (${data.ubicaciones.length})</div>
    <table width="100%">${ubicaciones}</table>
  </div>
  ${data.foto_perfil_url || data.foto_equipo_url ? `
  <div style="background:#fafaf7;border-radius:12px;padding:20px;margin-bottom:24px;">
    <div style="font-size:11px;font-weight:600;color:#971B2F;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Fotos</div>
    <table width="100%"><tr>
      ${data.foto_perfil_url ? `<td style="width:50%;padding-right:8px;"><img src="${data.foto_perfil_url}" style="width:100%;border-radius:8px;display:block;"/><div style="font-size:11px;color:#5c5c60;text-align:center;margin-top:6px;">Foto del consultorio</div></td>` : ''}
      ${data.foto_equipo_url ? `<td style="width:50%;padding-left:8px;"><img src="${data.foto_equipo_url}" style="width:100%;border-radius:8px;display:block;"/><div style="font-size:11px;color:#5c5c60;text-align:center;margin-top:6px;">Foto del equipo InBody</div></td>` : ''}
    </tr></table>
  </div>` : ''}
  <p style="margin:24px 0 16px;font-size:12px;color:#8a8a8f;line-height:1.6;">
    La solicitud quedó registrada con estado <strong>pendiente</strong>. Da clic para revisarla:
  </p>
  <div style="text-align:center;margin:0 0 8px;">
    <a href="${data.admin_url || 'https://directorio-inbody.vercel.app/inbody-admin/pendientes'}" style="display:inline-block;background:#971B2F;color:white;font-size:14px;font-weight:600;padding:14px 32px;border-radius:99px;text-decoration:none;">
      Revisar solicitud en el panel →
    </a>
  </div>
  <div style="text-align:center;margin-bottom:8px;font-size:11px;color:#8a8a8f;">
    o copia esta URL: <a href="${data.admin_url || 'https://directorio-inbody.vercel.app/inbody-admin/pendientes'}" style="color:#971B2F;text-decoration:none;word-break:break-all;">${data.admin_url || 'https://directorio-inbody.vercel.app/inbody-admin/pendientes'}</a>
  </div>
</td></tr>
<tr><td style="background:#fafaf7;padding:16px 32px;text-align:center;border-top:1px solid #ececea;">
  <div style="font-size:11px;color:#8a8a8f;">Directorio InBody México · Panel administrativo</div>
</td></tr>
</table></td></tr></table></body></html>`;
}

function renderDoctorEmail(data) {
  const ubicacionesText = (data.ubicaciones || []).map(function (u, i) {
    return `<tr><td style="padding:4px 0;font-size:13px;color:#5c5c60;">
      <strong style="color:#18181a;">${i === 0 ? 'Ubicación principal' : 'Ubicación ' + (i + 1)}:</strong><br/>
      ${escapeHTML(u.direccion_completa || '')}<br/>
      ${escapeHTML(u.ciudad || '')}, ${escapeHTML(u.estado || '')}
    </td></tr>`;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
<tr><td style="background:#971B2F;padding:32px;">
  <div style="color:white;font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;opacity:0.9;">Directorio InBody · México</div>
  <div style="color:white;font-size:24px;font-weight:600;margin-top:8px;line-height:1.3;">Recibimos tu solicitud</div>
</td></tr>
<tr><td style="padding:32px;">
  <p style="margin:0 0 16px;font-size:15px;color:#18181a;line-height:1.6;">Hola <strong>${escapeHTML(data.nombre)}</strong>,</p>
  <p style="margin:0 0 24px;font-size:14px;color:#5c5c60;line-height:1.7;">
    Gracias por solicitar tu registro en el Directorio Oficial de InBody México. Recibimos correctamente tu información.
  </p>
  <div style="background:#fafaf7;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:3px solid #971B2F;">
    <div style="font-size:11px;font-weight:600;color:#971B2F;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">Siguiente paso</div>
    <div style="font-size:14px;color:#18181a;line-height:1.6;">
      En las próximas <strong>3 a 5 días hábiles</strong> el equipo de InBody México verificará tu información y validará el número de serie de tu equipo. Te contactaremos cuando esté aprobada.
    </div>
  </div>
  <div style="margin-bottom:24px;">
    <div style="font-size:11px;font-weight:600;color:#8a8a8f;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Resumen de tu solicitud</div>
    <table width="100%" style="font-size:13px;border:1px solid #ececea;border-radius:10px;">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#5c5c60;width:130px;">Nombre:</td><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#18181a;font-weight:500;">${escapeHTML(data.nombre)}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#5c5c60;">Categoría:</td><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#18181a;">${escapeHTML(data.especialidad_label || data.especialidad)}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#5c5c60;">Modelo InBody:</td><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#18181a;">${escapeHTML(data.modelo_inbody_label || data.modelo_inbody)}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#5c5c60;">WhatsApp:</td><td style="padding:12px 16px;border-bottom:1px solid #ececea;color:#18181a;">${formatPhone(data.whatsapp)}</td></tr>
      <tr><td style="padding:12px 16px;color:#5c5c60;vertical-align:top;">Ubicaciones:</td><td style="padding:8px 16px;"><table width="100%">${ubicacionesText}</table></td></tr>
    </table>
  </div>
  <p style="margin:0;font-size:13px;color:#8a8a8f;line-height:1.6;">
    <strong style="color:#18181a;">Equipo InBody México</strong>
  </p>
</td></tr>
<tr><td style="background:#101820;padding:20px 32px;text-align:center;">
  <div style="font-size:11px;color:#8a8a8f;line-height:1.6;">
    © ${new Date().getFullYear()} InBody México · <a href="https://www.inbodymexico.com" style="color:#5c5c60;text-decoration:none;">inbodymexico.com</a>
  </div>
</td></tr>
</table></td></tr></table></body></html>`;
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function formatPhone(phone) {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) return '+52 ' + clean.slice(0,2) + ' ' + clean.slice(2,6) + ' ' + clean.slice(6);
  if (clean.length === 12 && clean.startsWith('52')) return '+52 ' + clean.slice(2,4) + ' ' + clean.slice(4,8) + ' ' + clean.slice(8);
  return phone;
}
