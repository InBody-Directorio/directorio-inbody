/**
 * POST /api/admin/cambiar-password
 * Cambia la contraseña del admin actual.
 */
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { currentPassword, newPassword, accessToken } = req.body;
    if (!currentPassword || !newPassword || !accessToken) return res.status(400).json({ error: 'Faltan parámetros' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) return res.status(401).json({ error: 'Sesión inválida' });

    // Verificar password actual con un signInWithPassword temporal
    const supabaseAnon = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    );

    const { error: signInErr } = await supabaseAnon.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInErr) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password: newPassword });
    if (updateErr) return res.status(500).json({ error: updateErr.message });

    await supabaseAdmin.from('audit_log').insert({
      admin_email: user.email,
      accion: 'cambiar_password',
      entidad: 'auth',
      detalles: {},
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
