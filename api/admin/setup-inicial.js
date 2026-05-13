/**
 * POST /api/admin/setup-inicial
 *
 * Crea los usuarios iniciales en Supabase Auth con sus contraseñas.
 * Solo se puede correr UNA VEZ. Si ya hay usuarios admin con auth, falla.
 *
 * Llamar manualmente desde el navegador:
 *   fetch('/api/admin/setup-inicial', { method: 'POST' }).then(r => r.json()).then(console.log)
 */
import { createClient } from '@supabase/supabase-js';

const ADMINS_INICIALES = [
  {
    email: 'directorioinbody@gmail.com',
    password: 'InBody2026Admin!',
    nombre: 'Equipo InBody México',
  },
  {
    email: 'rodrigo@marketinglab.mx',
    password: 'MktLab2026Admin!',
    nombre: 'Rodrigo Vázquez (MKT LAB)',
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

    const results = [];

    for (const admin of ADMINS_INICIALES) {
      // Verificar si ya existe en Auth
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const existing = users.find(function (u) {
        return u.email && u.email.toLowerCase() === admin.email.toLowerCase();
      });

      if (existing) {
        results.push({ email: admin.email, status: 'ya_existe', auth_id: existing.id });
        continue;
      }

      // Crear usuario
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true,
      });

      if (createErr) {
        results.push({ email: admin.email, status: 'error', error: createErr.message });
        continue;
      }

      results.push({ email: admin.email, status: 'creado', auth_id: newUser.user.id });
    }

    // Asegurar que estén en la tabla admins también (idempotente)
    for (const admin of ADMINS_INICIALES) {
      await supabaseAdmin.from('admins').upsert(
        {
          email: admin.email,
          nombre: admin.nombre,
          nivel: 'super_admin',
          activo: true,
        },
        { onConflict: 'email' }
      );
    }

    return res.status(200).json({
      ok: true,
      message: 'Setup completado. Ya puedes hacer login con los correos y contraseñas iniciales.',
      results: results,
      credenciales: [
        { email: 'directorioinbody@gmail.com', password: 'InBody2026Admin!' },
        { email: 'rodrigo@marketinglab.mx', password: 'MktLab2026Admin!' },
      ],
    });
  } catch (err) {
    console.error('Error setup-inicial:', err);
    return res.status(500).json({ error: err.message });
  }
}
