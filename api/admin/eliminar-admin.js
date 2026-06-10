/**
 * POST /api/admin/eliminar-admin
 * Solo super_admin puede ejecutar.
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

    const { data: currentAdmin } = await supabaseAdmin
      .from('admins').select('id, nivel, activo').ilike('email', user.email).single();
    if (!currentAdmin || !currentAdmin.activo || currentAdmin.nivel !== 'super_admin') {
      return res.status(403).json({ error: 'Sin permisos' });
    }

    if (currentAdmin.id === adminId) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }

    const { data: target } = await supabaseAdmin
      .from('admins').select('email, auth_user_id').eq('id', adminId).single();
    if (!target) return res.status(404).json({ error: 'Admin no encontrado' });

    await supabaseAdmin.from('admins').delete().eq('id', adminId);

    if (target.auth_user_id) {
      await supabaseAdmin.auth.admin.deleteUser(target.auth_user_id);
    }

    await supabaseAdmin.from('audit_log').insert({
      admin_email: user.email,
      accion: 'eliminar_admin',
      entidad: 'admins',
      entidad_id: adminId,
      detalles: { email: target.email },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
