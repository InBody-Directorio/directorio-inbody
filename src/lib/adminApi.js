import { supabase } from './supabase.js';

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session ? data.session.access_token : null;
}

async function getAdminEmail() {
  const { data } = await supabase.auth.getUser();
  return data.user ? data.user.email : null;
}

async function callAdminApi(endpoint, body) {
  const accessToken = await getAccessToken();
  const adminEmail = await getAdminEmail();

  if (!accessToken || !adminEmail) {
    throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
  }

  const res = await fetch('/api/admin/' + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, accessToken: accessToken, adminEmail: adminEmail }),
  });

  if (!res.ok) {
    const err = await res.json().catch(function () { return { error: 'Error desconocido' }; });
    throw new Error(err.error || 'Error en la operación');
  }

  return res.json();
}

export function aprobarProfesional(profesionalId) {
  return callAdminApi('aprobar', { profesionalId: profesionalId });
}

export function rechazarProfesional(profesionalId, motivo) {
  return callAdminApi('rechazar', { profesionalId: profesionalId, motivo: motivo });
}

export function restaurarProfesional(profesionalId) {
  return callAdminApi('restaurar', { profesionalId: profesionalId });
}

export function crearAdmin(email, nombre, nivel) {
  return callAdminApi('crear-admin', { email: email, nombre: nombre, nivel: nivel });
}

export function eliminarAdmin(adminId) {
  return callAdminApi('eliminar-admin', { adminId: adminId });
}

export function cambiarPassword(currentPassword, newPassword) {
  return callAdminApi('cambiar-password', { currentPassword: currentPassword, newPassword: newPassword });
}
