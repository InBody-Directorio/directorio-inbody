/**
 * POST /api/admin/restaurar
 * Restaura un profesional rechazado a estado pendiente.
 */
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { profesionalId, accessToken } = req.body;
    if (!profesionalId || !accessToken) return res.status(400).json({ error: 'Faltan parámetros' });

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) return res.status(401).json({ error: 'Sesión inválida' });

    const { data: admin } = await supabaseAdmin
      .from('admins').select('email, activo').ilike('email', user.email).single();
    if (!admin || !admin.activo) return res.status(403).json({ error: 'Sin permisos' });

    const { data: prof } = await supabaseAdmin
      .from('profesionales').select('nombre, email').eq('id', profesionalId).single();

    const { error: updErr } = await supabaseAdmin
      .from('profesionales')
      .update({
        status: 'pendiente',
        motivo_rechazo: null,
        rechazado_por: null,
        rechazado_at: null,
        aprobado_por: null,
        aprobado_at: null,
      })
      .eq('id', profesionalId);

    if (updErr) return res.status(500).json({ error: updErr.message });

    await supabaseAdmin.from('audit_log').insert({
      admin_email: admin.email,
      accion: 'restaurar_profesional',
      entidad: 'profesionales',
      entidad_id: profesionalId,
      detalles: prof ? { nombre: prof.nombre, email: prof.email } : null,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error restaurar:', err);
    return res.status(500).json({ error: err.message });
  }
}
