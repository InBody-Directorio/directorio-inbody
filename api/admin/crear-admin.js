/**
 * POST /api/admin/crear-admin
 * Crea un nuevo admin. Solo super_admin pueden hacer esto.
 *
 * Pasos:
 * 1. Verifica que quien hace la petición sea super_admin
 * 2. Crea usuario en Supabase Auth con contraseña temporal
 * 3. Inserta en tabla admins
 * 4. Manda correo al nuevo admin con sus credenciales
 */
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'InBody Directorio <directorio@marketinglab.mx>';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, nombre, nivel, password, accessToken } = req.body;

    if (!email || !password || !accessToken) {
      return res.status(400).json({ error: 'Faltan parámetros' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verificar sesión y que sea super_admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) return res.status(401).json({ error: 'Sesión inválida' });

    const { data: requestingAdmin } = await supabaseAdmin
      .from('admins').select('email, nivel, activo').ilike('email', user.email).single();

    if (!requestingAdmin || !requestingAdmin.activo || requestingAdmin.nivel !== 'super_admin') {
      return res.status(403).json({ error: 'Solo super admins pueden crear nuevos admins' });
    }

    const emailLower = email.toLowerCase().trim();

    // Verificar si ya existe
    const { data: existing } = await supabaseAdmin
      .from('admins').select('id').ilike('email', emailLower).maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'Ya existe un admin con ese correo' });
    }

    // 1. Crear usuario en Supabase Auth
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: emailLower,
      password: password,
      email_confirm: true, // Auto-confirma, no requiere clic en link
    });

    if (createErr) {
      return res.status(500).json({ error: 'Error creando usuario: ' + createErr.message });
    }

    // 2. Insertar en tabla admins
    const { error: insertErr } = await supabaseAdmin
      .from('admins').insert({
        email: emailLower,
        nombre: nombre || null,
        nivel: nivel === 'super_admin' ? 'super_admin' : 'admin',
        activo: true,
      });

    if (insertErr) {
      // Rollback: borrar usuario de Auth
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return res.status(500).json({ error: 'Error registrando admin: ' + insertErr.message });
    }

    // 3. Audit log
    await supabaseAdmin.from('audit_log').insert({
      admin_email: requestingAdmin.email,
      accion: 'crear_admin',
      entidad: 'admins',
      detalles: { email: emailLower, nombre: nombre, nivel: nivel },
    });

    // 4. Correo al nuevo admin
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_EMAIL,
        to: emailLower,
        subject: 'Acceso al Panel · Directorio InBody México',
        html: renderWelcomeEmail(emailLower, password, nombre),
      });
    } catch (e) {
      console.error('Error correo bienvenida:', e);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error crear-admin:', err);
    return res.status(500).json({ error: err.message });
  }
}

function renderWelcomeEmail(email, password, nombre) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
<tr><td style="background:#E31937;padding:32px;">
  <div style="color:white;font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;opacity:0.9;">Directorio InBody · México</div>
  <div style="color:white;font-size:24px;font-weight:600;margin-top:8px;">Bienvenido al panel</div>
</td></tr>
<tr><td style="padding:32px;">
  <p style="margin:0 0 16px;font-size:15px;color:#18181a;">Hola${nombre ? ' <strong>' + escapeHTML(nombre) + '</strong>' : ''},</p>
  <p style="margin:0 0 24px;font-size:14px;color:#5c5c60;line-height:1.7;">
    Tienes acceso al Panel Administrativo del Directorio InBody México. A continuación tus credenciales de acceso:
  </p>
  <div style="background:#fafaf7;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:3px solid #E31937;">
    <div style="font-size:11px;font-weight:600;color:#5c5c60;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Correo</div>
    <div style="font-size:14px;color:#18181a;font-family:Menlo,monospace;margin-bottom:16px;">${escapeHTML(email)}</div>
    <div style="font-size:11px;font-weight:600;color:#5c5c60;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Contraseña</div>
    <div style="font-size:14px;color:#18181a;font-family:Menlo,monospace;background:#fff;padding:8px 12px;border-radius:6px;border:1px solid #ececea;">${escapeHTML(password)}</div>
  </div>
  <div style="background:#fff7e0;border-radius:10px;padding:14px 16px;margin-bottom:24px;border-left:3px solid #d49500;">
    <div style="font-size:12px;color:#5c5c60;line-height:1.6;">
      <strong style="color:#7a5800;">Importante:</strong> cambia tu contraseña al iniciar sesión por seguridad. Puedes hacerlo desde "Mi cuenta" en el panel.
    </div>
  </div>
  <p style="margin:0;font-size:13px;color:#8a8a8f;line-height:1.6;">
    <strong style="color:#18181a;">Equipo InBody México</strong>
  </p>
</td></tr>
<tr><td style="background:#18181a;padding:20px 32px;text-align:center;">
  <div style="font-size:11px;color:#8a8a8f;line-height:1.6;">
    © ${new Date().getFullYear()} InBody México
  </div>
</td></tr>
</table></td></tr></table></body></html>`;
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
