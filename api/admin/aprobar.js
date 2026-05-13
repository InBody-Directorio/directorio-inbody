/**
 * POST /api/admin/aprobar
 *
 * Aprueba un profesional pendiente.
 * Manda correo al doctor avisando.
 * Registra en audit_log.
 *
 * Requiere: token de sesión válido y admin_email autorizado.
 */
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'InBody Directorio <directorio@marketinglab.mx>';

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

    // Verificar que el usuario tenga sesión válida
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return res.status(401).json({ error: 'Sesión inválida' });
    }

    // Verificar que sea admin autorizado
    const { data: admin } = await supabaseAdmin
      .from('admins')
      .select('email, nivel, activo')
      .ilike('email', user.email)
      .single();

    if (!admin || !admin.activo) {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }

    // Obtener datos del profesional
    const { data: prof, error: profErr } = await supabaseAdmin
      .from('profesionales')
      .select('*, ubicaciones(*)')
      .eq('id', profesionalId)
      .single();

    if (profErr || !prof) {
      return res.status(404).json({ error: 'Profesional no encontrado' });
    }

    // Actualizar status a aprobado
    const { error: updErr } = await supabaseAdmin
      .from('profesionales')
      .update({
        status: 'aprobado',
        aprobado_por: admin.email,
        aprobado_at: new Date().toISOString(),
        motivo_rechazo: null,
        rechazado_por: null,
        rechazado_at: null,
      })
      .eq('id', profesionalId);

    if (updErr) {
      return res.status(500).json({ error: 'Error al aprobar: ' + updErr.message });
    }

    // Registrar en audit_log
    await supabaseAdmin.from('audit_log').insert({
      admin_email: admin.email,
      accion: 'aprobar_profesional',
      entidad: 'profesionales',
      entidad_id: profesionalId,
      detalles: { nombre: prof.nombre, email: prof.email },
    });

    // Mandar correo al doctor
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_EMAIL,
        to: prof.email,
        subject: '¡Estás dentro! · Directorio InBody México',
        html: renderApprovedEmail(prof),
      });
    } catch (e) {
      console.error('Error mandando correo de aprobación:', e);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error en /api/admin/aprobar:', err);
    return res.status(500).json({ error: err.message });
  }
}

function renderApprovedEmail(prof) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
<tr><td style="background:#1d9e75;padding:32px;">
  <div style="color:white;font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;opacity:0.9;">Directorio InBody · México</div>
  <div style="color:white;font-size:28px;font-weight:600;margin-top:8px;line-height:1.2;">¡Estás dentro!</div>
</td></tr>
<tr><td style="padding:32px;">
  <p style="margin:0 0 16px;font-size:15px;color:#18181a;line-height:1.6;">Hola <strong>${escapeHTML(prof.nombre)}</strong>,</p>
  <p style="margin:0 0 24px;font-size:14px;color:#5c5c60;line-height:1.7;">
    Tenemos buenas noticias: <strong style="color:#1d9e75;">tu registro fue aprobado</strong> y ya apareces en el Directorio Oficial de InBody México.
  </p>
  <p style="margin:0 0 24px;font-size:14px;color:#5c5c60;line-height:1.7;">
    Tus futuros pacientes ya pueden encontrarte filtrando por tu especialidad y ubicación. Cuando alguien dé clic en tu perfil, podrá contactarte directo por WhatsApp.
  </p>
  <div style="text-align:center;margin:32px 0;">
    <a href="https://www.inbodymexico.com" style="display:inline-block;background:#E31937;color:white;font-size:14px;font-weight:600;padding:14px 28px;border-radius:99px;text-decoration:none;">Ver el directorio</a>
  </div>
  <div style="background:#fafaf7;border-radius:12px;padding:20px;margin-bottom:24px;border-left:3px solid #1d9e75;">
    <div style="font-size:11px;font-weight:600;color:#1d9e75;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">¿Necesitas cambiar algo?</div>
    <div style="font-size:13px;color:#5c5c60;line-height:1.6;">
      Si necesitas actualizar tu información (cambio de dirección, nueva sucursal, fotos nuevas, etc.) responde a este correo y nuestro equipo te ayudará.
    </div>
  </div>
  <p style="margin:0;font-size:13px;color:#8a8a8f;line-height:1.6;">
    Bienvenido al directorio.<br/>
    <strong style="color:#18181a;">Equipo InBody México</strong>
  </p>
</td></tr>
<tr><td style="background:#18181a;padding:20px 32px;text-align:center;">
  <div style="font-size:11px;color:#8a8a8f;line-height:1.6;">
    © ${new Date().getFullYear()} InBody México<br/>
    <a href="https://www.inbodymexico.com" style="color:#5c5c60;text-decoration:none;">inbodymexico.com</a>
  </div>
</td></tr>
</table></td></tr></table></body></html>`;
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
