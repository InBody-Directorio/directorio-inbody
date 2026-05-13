/**
 * POST /api/admin/cambiar-password
 * - Si solo viene `newPassword`: cambia la contraseña del propio admin
 * - Si viene `targetEmail` + `newPassword`: cambia la de otro admin (solo super_admin)
 */
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { newPassword, targetEmail, accessToken } = req.body;
    if (!newPassword || !accessToken) return res.status(400).json({ error: 'Faltan parámetros' });

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) return res.status(401).json({ error: 'Sesión inválida' });

    const { data: requestingAdmin } = await supabaseAdmin
      .from('admins').select('email, nivel, activo').ilike('email', user.email).single();

    if (!requestingAdmin || !requestingAdmin.activo) return res.status(403).json({ error: 'Sin permisos' });

    // ¿Cambiando la propia o la de alguien más?
    const isOwn = !targetEmail || targetEmail.toLowerCase() === user.email.toLowerCase();

    if (!isOwn && requestingAdmin.nivel !== 'super_admin') {
      return res.status(403).json({ error: 'Solo super admins pueden cambiar la contraseña de otros' });
    }

    // Buscar el user a actualizar
    const targetEmailFinal = isOwn ? user.email : targetEmail;
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const targetUser = users.find(function (u) {
      return u.email && u.email.toLowerCase() === targetEmailFinal.toLowerCase();
    });

    if (!targetUser) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    );

    if (updErr) return res.status(500).json({ error: updErr.message });

    await supabaseAdmin.from('audit_log').insert({
      admin_email: requestingAdmin.email,
      accion: isOwn ? 'cambiar_propia_password' : 'cambiar_password_otro',
      entidad: 'admins',
      detalles: { target_email: targetEmailFinal },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error cambiar-password:', err);
    return res.status(500).json({ error: err.message });
  }
}
