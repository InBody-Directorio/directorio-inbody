/**
 * POST /api/admin/setup-inicial
 *
 * CORRER UNA SOLA VEZ desde la consola del navegador:
 *   fetch('/api/admin/setup-inicial', {method:'POST'}).then(r=>r.json()).then(console.log)
 *
 * Crea los 2 admins iniciales en Supabase Auth con contraseñas hardcoded.
 * Después de correr, este endpoint queda bloqueado.
 */
import { createClient } from '@supabase/supabase-js';

const INITIAL_ADMINS = [
  {
    email: 'directorioinbody@gmail.com',
    password: 'InBody2026Admin!',
    nombre: 'Directorio InBody',
    nivel: 'super_admin',
  },
  {
    email: 'rodrigo@marketinglab.mx',
    password: 'MktLab2026Admin!',
    nombre: 'Rodrigo Vázquez',
    nivel: 'super_admin',
  },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Si ya hay admins, bloquear
    const { count } = await supabaseAdmin.from('admins').select('*', { count: 'exact', head: true });
    if (count && count > 0) {
      return res.status(403).json({ error: 'Setup inicial ya ejecutado. Si necesitas resetear, hazlo desde Supabase manualmente.' });
    }

    const results = [];

    for (const a of INITIAL_ADMINS) {
      try {
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: a.email,
          password: a.password,
          email_confirm: true,
          user_metadata: { nombre: a.nombre },
        });

        if (createErr && createErr.message.indexOf('already') === -1) {
          results.push({ email: a.email, error: createErr.message });
          continue;
        }

        const userId = created ? created.user.id : null;

        await supabaseAdmin.from('admins').insert({
          email: a.email,
          nombre: a.nombre,
          nivel: a.nivel,
          activo: true,
          auth_user_id: userId,
        });

        results.push({ email: a.email, ok: true, password: a.password });
      } catch (err) {
        results.push({ email: a.email, error: err.message });
      }
    }

    return res.status(200).json({ ok: true, admins: results });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
