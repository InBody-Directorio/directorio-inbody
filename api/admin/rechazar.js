/**
 * POST /api/admin/rechazar
 * Rechaza un profesional pendiente con motivo opcional.
 */
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'InBody Directorio <directorio@marketinglab.mx>';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { profesionalId, adminEmail, accessToken, motivo } = req.body;

    if (!profesionalId || !adminEmail || !accessToken) {
      return res.status(400).json({ error: 'Faltan parámetros' });
    }

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) return res.status(401).json({ error: 'Sesión inválida' });

    const { data: admin } = await supabaseAdmin
      .from('admins').select('email, activo')
      .ilike('email', user.email).single();

    if (!admin || !admin.activo) return res.status(403).json({ error: 'Sin permisos' });

    const { data: prof, error: profErr } = await supabaseAdmin
      .from('profesionales').select('*').eq('id', profesionalId).single();

    if (profErr || !prof) return res.status(404).json({ error: 'No encontrado' });

    const { error: updErr } = await supabaseAdmin
      .from('profesionales')
      .update({
        status: 'rechazado',
        rechazado_por: admin.email,
        rechazado_at: new Date().toISOString(),
        motivo_rechazo: motivo || null,
      })
      .eq('id', profesionalId);

    if (updErr) return res.status(500).json({ error: updErr.message });

    await supabaseAdmin.from('audit_log').insert({
      admin_email: admin.email,
      accion: 'rechazar_profesional',
      entidad: 'profesionales',
      entidad_id: profesionalId,
      detalles: { nombre: prof.nombre, email: prof.email, motivo: motivo },
    });

    // Correo al doctor
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_EMAIL,
        to: prof.email,
        subject: 'Sobre tu solicitud · Directorio InBody México',
        html: renderRejectedEmail(prof, motivo),
      });
    } catch (e) {
      console.error('Error correo rechazo:', e);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error rechazar:', err);
    return res.status(500).json({ error: err.message });
  }
}

function renderRejectedEmail(prof, motivo) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
<tr><td style="background:#18181a;padding:32px;">
  <div style="color:white;font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;opacity:0.9;">Directorio InBody · México</div>
  <div style="color:white;font-size:24px;font-weight:600;margin-top:8px;line-height:1.3;">Sobre tu solicitud</div>
</td></tr>
<tr><td style="padding:32px;">
  <p style="margin:0 0 16px;font-size:15px;color:#18181a;line-height:1.6;">Hola <strong>${escapeHTML(prof.nombre)}</strong>,</p>
  <p style="margin:0 0 24px;font-size:14px;color:#5c5c60;line-height:1.7;">
    Lamentamos informarte que en esta ocasión <strong>no pudimos aprobar tu solicitud</strong> para aparecer en el Directorio Oficial de InBody México.
  </p>
  ${motivo ? `
  <div style="background:#fafaf7;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:3px solid #E31937;">
    <div style="font-size:11px;font-weight:600;color:#E31937;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">Motivo</div>
    <div style="font-size:14px;color:#18181a;line-height:1.6;">${escapeHTML(motivo)}</div>
  </div>` : ''}
  <p style="margin:0 0 16px;font-size:14px;color:#5c5c60;line-height:1.7;">
    Si crees que esto es un error o quieres aclarar alguna duda, puedes responder directamente a este correo.
  </p>
  <p style="margin:0 0 24px;font-size:14px;color:#5c5c60;line-height:1.7;">
    También puedes enviar una nueva solicitud con la información corregida cuando estés listo.
  </p>
  <p style="margin:0;font-size:13px;color:#8a8a8f;line-height:1.6;">
    <strong style="color:#18181a;">Equipo InBody México</strong>
  </p>
</td></tr>
<tr><td style="background:#18181a;padding:20px 32px;text-align:center;">
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
