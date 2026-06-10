/**
 * POST /api/admin/crear-admin
 * Crea un nuevo administrador con contraseña generada.
 * Solo super_admin puede ejecutar.
 */
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, nombre, nivel, accessToken } = req.body;
    if (!email || !nombre || !nivel || !accessToken) return res.status(400).json({ error: 'Faltan parámetros' });
    if (['admin', 'super_admin'].indexOf(nivel) === -1) return res.status(400).json({ error: 'Nivel inválido' });

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) return res.status(401).json({ error: 'Sesión inválida' });

    const { data: currentAdmin } = await supabaseAdmin
      .from('admins').select('nivel, activo').ilike('email', user.email).single();
    if (!currentAdmin || !currentAdmin.activo || currentAdmin.nivel !== 'super_admin') {
      return res.status(403).json({ error: 'Solo super admins pueden crear admins' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data: existing } = await supabaseAdmin
      .from('admins').select('id').ilike('email', cleanEmail).maybeSingle();
    if (existing) return res.status(409).json({ error: 'Este correo ya tiene cuenta' });

    const password = generateSecurePassword();

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: { nombre: nombre },
    });

    if (createErr) return res.status(500).json({ error: 'Error creando usuario: ' + createErr.message });

    const { error: insertErr } = await supabaseAdmin.from('admins').insert({
      email: cleanEmail,
      nombre: nombre,
      nivel: nivel,
      activo: true,
      auth_user_id: created.user.id,
    });

    if (insertErr) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return res.status(500).json({ error: 'Error guardando admin: ' + insertErr.message });
    }

    await supabaseAdmin.from('audit_log').insert({
      admin_email: user.email,
      accion: 'crear_admin',
      entidad: 'admins',
      detalles: { nombre: nombre, email: cleanEmail, nivel: nivel },
    });

    return res.status(200).json({ ok: true, email: cleanEmail, password: password });
  } catch (err) {
    console.error('Error crear-admin:', err);
    return res.status(500).json({ error: err.message });
  }
}

function generateSecurePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const nums = '23456789';
  const special = '!@#$%&*';
  const all = upper + lower + nums + special;
  let pass = upper[Math.floor(Math.random() * upper.length)] +
             lower[Math.floor(Math.random() * lower.length)] +
             nums[Math.floor(Math.random() * nums.length)] +
             special[Math.floor(Math.random() * special.length)];
  for (let i = 0; i < 10; i++) {
    pass += all[Math.floor(Math.random() * all.length)];
  }
  return pass.split('').sort(function () { return 0.5 - Math.random(); }).join('');
}
