import { supabase } from './supabase.js';

async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');
  return session.access_token;
}

export async function aprobarProfesional(profesionalId) {
  const token = await getAccessToken();
  const { data: { user } } = await supabase.auth.getUser();
  const res = await fetch('/api/admin/aprobar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profesionalId, adminEmail: user.email, accessToken: token }),
  });
  if (!res.ok) {
    const err = await res.json().catch(function () { return {}; });
    throw new Error(err.error || 'Error al aprobar');
  }
  return await res.json();
}

export async function rechazarProfesional(profesionalId, motivo) {
  const token = await getAccessToken();
  const { data: { user } } = await supabase.auth.getUser();
  const res = await fetch('/api/admin/rechazar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profesionalId, adminEmail: user.email, accessToken: token, motivo }),
  });
  if (!res.ok) {
    const err = await res.json().catch(function () { return {}; });
    throw new Error(err.error || 'Error al rechazar');
  }
  return await res.json();
}

export async function restaurarProfesional(profesionalId) {
  const token = await getAccessToken();
  const res = await fetch('/api/admin/restaurar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profesionalId, accessToken: token }),
  });
  if (!res.ok) {
    const err = await res.json().catch(function () { return {}; });
    throw new Error(err.error || 'Error al restaurar');
  }
  return await res.json();
}

export async function crearAdmin(email, password, nombre, nivel) {
  const token = await getAccessToken();
  const res = await fetch('/api/admin/crear-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nombre, nivel, accessToken: token }),
  });
  if (!res.ok) {
    const err = await res.json().catch(function () { return {}; });
    throw new Error(err.error || 'Error al crear admin');
  }
  return await res.json();
}

export async function eliminarAdmin(adminId) {
  const token = await getAccessToken();
  const res = await fetch('/api/admin/eliminar-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, accessToken: token }),
  });
  if (!res.ok) {
    const err = await res.json().catch(function () { return {}; });
    throw new Error(err.error || 'Error al eliminar admin');
  }
  return await res.json();
}

export async function cambiarPassword(newPassword, targetEmail) {
  const token = await getAccessToken();
  const res = await fetch('/api/admin/cambiar-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPassword, targetEmail, accessToken: token }),
  });
  if (!res.ok) {
    const err = await res.json().catch(function () { return {}; });
    throw new Error(err.error || 'Error al cambiar contraseña');
  }
  return await res.json();
}
