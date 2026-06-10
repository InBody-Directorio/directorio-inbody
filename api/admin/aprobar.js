/**
 * POST /api/admin/aprobar
 * Aprueba un profesional pendiente. Correo en background.
 */
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'InBody Directorio <directorio@marketinglab.mx>';

const COLOR_RED = '#971B2F';
const COLOR_BLACK = '#101820';
const COLOR_COOL_GRAY = '#67767F';
const COLOR_BG = '#fafaf7';
const COLOR_GREEN = '#1d9e75';

const FONT_LINK = `<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Noto+Sans:wght@400;500;600&display=swap" rel="stylesheet">`;
const FONT_STACK = `'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
const DISPLAY_FONT_STACK = `'Lato', 'Noto Sans', -apple-system, sans-serif`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { profesionalId, adminEmail, accessToken } = req.body;

    if (!profesionalId || !adminEmail || !accessToken) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) return res.status(401).json({ error: 'Sesión inválida' });

    const { data: admin } = await supabaseAdmin
      .from('admins').select('email, nivel, activo').ilike('email', user.email).single();
    if (!admin || !admin.activo) return res.status(403).json({ error: 'No tienes permisos de administrador' });

    const { data: prof, error: profErr } = await supabaseAdmin
      .from('profesionales').select('id, nombre, email').eq('id', profesionalId).single();
    if (profErr || !prof) return res.status(404).json({ error: 'Profesional no encontrado' });

    const [{ error: updErr }] = await Promise.all([
      supabaseAdmin.from('profesionales').update({
        status: 'aprobado',
        aprobado_por: admin.email,
        aprobado_at: new Date().toISOString(),
        motivo_rechazo: null,
        rechazado_por: null,
        rechazado_at: null,
      }).eq('id', profesionalId),
      supabaseAdmin.from('audit_log').insert({
        admin_email: admin.email,
        accion: 'aprobar_profesional',
        entidad: 'profesionales',
        entidad_id: profesionalId,
        detalles: { nombre: prof.nombre, email: prof.email },
      }),
    ]);

    if (updErr) return res.status(500).json({ error: 'Error al aprobar: ' + updErr.message });

    Promise.race([
      sendApprovalEmail(prof),
      new Promise(function (_, reject) { setTimeout(reject, 9000); }),
    ]).catch(function (err) { console.error('Error/timeout correo aprobación:', err); });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error en /api/admin/aprobar:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function sendApprovalEmail(prof) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: FROM_EMAIL,
    to: prof.email,
    subject: '¡Estás dentro! · Directorio InBody México',
    html: renderApprovedEmail(prof),
  });
}

function renderApprovedEmail(prof) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>${FONT_LINK}</head>
<body style="margin:0;padding:0;background:${COLOR_BG};font-family:${FONT_STACK};">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(16,24,32,0.06);">
<tr><td style="background:${COLOR_GREEN};padding:32px;">
  <div style="color:white;font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;opacity:0.9;">Directorio InBody · México</div>
  <div style="color:white;font-size:28px;font-weight:700;margin-top:8px;line-height:1.2;font-family:${DISPLAY_FONT_STACK};">¡Estás dentro!</div>
</td></tr>
<tr><td style="padding:32px;">
  <p style="margin:0 0 16px;font-size:15px;color:${COLOR_BLACK};line-height:1.6;">Hola <strong>${escapeHTML(prof.nombre)}</strong>,</p>
  <p style="margin:0 0 24px;font-size:14px;color:${COLOR_COOL_GRAY};line-height:1.7;">
    Tenemos buenas noticias: <strong style="color:${COLOR_GREEN};">tu registro fue aprobado</strong> y ya apareces en el Directorio Oficial de InBody México.
  </p>
  <p style="margin:0 0 24px;font-size:14px;color:${COLOR_COOL_GRAY};line-height:1.7;">
    Tus futuros pacientes ya pueden encontrarte filtrando por tu categoría y ubicación. Cuando alguien dé clic en tu perfil, podrá contactarte directo por WhatsApp.
  </p>
  <div style="text-align:center;margin:32px 0;">
    <a href="https://www.inbodymexico.com" style="display:inline-block;background:${COLOR_RED};color:white;font-size:14px;font-weight:600;padding:14px 28px;border-radius:99px;text-decoration:none;">Ver el directorio</a>
  </div>
  <div style="background:${COLOR_BG};border-radius:12px;padding:20px;margin-bottom:24px;border-left:3px solid ${COLOR_GREEN};">
    <div style="font-size:11px;font-weight:600;color:${COLOR_GREEN};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">¿Necesitas cambiar algo?</div>
    <div style="font-size:13px;color:${COLOR_COOL_GRAY};line-height:1.6;">
      Si necesitas actualizar tu información (cambio de dirección, nueva sucursal, fotos nuevas, etc.) responde a este correo y nuestro equipo te ayudará.
    </div>
  </div>
  <p style="margin:0;font-size:13px;color:#8a8a8f;line-height:1.6;">
    Bienvenido al directorio.<br/>
    <strong style="color:${COLOR_BLACK};">Equipo InBody México</strong>
  </p>
</td></tr>
<tr><td style="background:${COLOR_BLACK};padding:20px 32px;text-align:center;">
  <div style="font-size:11px;color:#8a8a8f;line-height:1.6;">
    © ${new Date().getFullYear()} InBody México<br/>
    <a href="https://www.inbodymexico.com" style="color:${COLOR_COOL_GRAY};text-decoration:none;">inbodymexico.com</a>
  </div>
</td></tr>
</table></td></tr></table></body></html>`;
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
