/**
 * POST /api/admin/eliminar-admin
 * Elimina un admin. Solo super_admin pueden hacer esto.
 */
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { adminId, accessToken } = req.body;
    if (!adminId || !accessToken) return res.status(400).json({ error: 'Faltan parámetros' });

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) return res.status(401).json({ error: 'Sesión inválida' });

    const { data: requestingAdmin } = await supabaseAdmin
      .from('admins').select('email, nivel, activo').ilike('email', user.email).single();

    if (!requestingAdmin || !requestingAdmin.activo || requestingAdmin.nivel !== 'super_admin') {
      return res.status(403).json({ error: 'Solo super admins pueden eliminar admins' });
    }

    const { data: targetAdmin } = await supabaseAdmin
      .from('admins').select('email').eq('id', adminId).single();

    if (!targetAdmin) return res.status(404).json({ error: 'Admin no encontrado' });

    // No permitir auto-eliminación
    if (targetAdmin.email.toLowerCase() === requestingAdmin.email.toLowerCase()) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }

    // Eliminar de tabla admins
    const { error: delErr } = await supabaseAdmin.from('admins').delete().eq('id', adminId);
    if (delErr) return res.status(500).json({ error: delErr.message });

    // Eliminar también de Supabase Auth
    try {
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const userToDelete = users.find(function (u) {
        return u.email && u.email.toLowerCase() === targetAdmin.email.toLowerCase();
      });
      if (userToDelete) {
        await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);
      }
    } catch (e) {
      console.error('Error eliminando user de auth:', e);
    }

    await supabaseAdmin.from('audit_log').insert({
      admin_email: requestingAdmin.email,
      accion: 'eliminar_admin',
      entidad: 'admins',
      entidad_id: adminId,
      detalles: { email_eliminado: targetAdmin.email },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error eliminar-admin:', err);
    return res.status(500).json({ error: err.message });
  }
}
