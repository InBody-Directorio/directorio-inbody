import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * FIX (sep 2026): detecta si el usuario llegó a la página por un enlace de correo
 * de Supabase (recuperar contraseña, enlace mágico o invitación). Se lee ANTES
 * de crear el cliente, porque el cliente procesa y puede limpiar el hash.
 * El panel admin usa esto para mostrar la pantalla de "nueva contraseña".
 */
function detectarEnlaceDeCorreo() {
  if (typeof window === 'undefined') return false;
  const url = (window.location.hash || '') + (window.location.search || '');
  return /type=(recovery|magiclink|invite)/.test(url);
}
export const llegoPorEnlaceDeCorreo = detectarEnlaceDeCorreo();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
