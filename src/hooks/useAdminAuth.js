import { useState, useEffect, useRef } from 'react';
import { supabase, llegoPorEnlaceDeCorreo } from '../lib/supabase.js';

/**
 * Hook que maneja autenticación admin.
 *
 * Fix de loading infinito:
 * - Usa initialized ref para que onAuthStateChange NO toque loading después del init
 * - Safety timeout de 8s para evitar quedarse colgado si Supabase no responde
 */
export function useAdminAuth() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  // FIX (sep 2026): true cuando el usuario entró por enlace de correo (recuperar
  // contraseña / enlace mágico). El panel muestra la pantalla de nueva contraseña.
  const [modoNuevaPassword, setModoNuevaPassword] = useState(llegoPorEnlaceDeCorreo);
  const initialized = useRef(false);

  useEffect(function () {
    let mounted = true;
    let safetyTimer;

    async function init() {
      safetyTimer = setTimeout(function () {
        if (mounted && loading) {
          console.warn('Auth init timeout, liberando loading');
          setLoading(false);
        }
      }, 8000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session && session.user) {
          await checkAdmin(session.user);
        } else {
          setUser(null);
          setAdmin(null);
        }
      } catch (err) {
        console.error('Error initial auth check:', err);
      } finally {
        if (mounted) {
          clearTimeout(safetyTimer);
          setLoading(false);
          initialized.current = true;
        }
      }
    }

    async function checkAdmin(authUser) {
      try {
        const { data } = await supabase
          .from('admins')
          .select('*')
          .ilike('email', authUser.email)
          .eq('activo', true)
          .single();

        if (data && mounted) {
          setUser(authUser);
          setAdmin(data);
        } else if (mounted) {
          setUser(null);
          setAdmin(null);
          await supabase.auth.signOut();
        }
      } catch (err) {
        console.error('Error checking admin:', err);
        if (mounted) {
          setUser(null);
          setAdmin(null);
        }
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(function (event, session) {
      if (!mounted) return;
      // Este evento puede llegar antes del init; se atiende siempre.
      if (event === 'PASSWORD_RECOVERY') {
        setModoNuevaPassword(true);
        return;
      }
      if (!initialized.current) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setAdmin(null);
      } else if (event === 'SIGNED_IN' && session && session.user) {
        checkAdmin(session.user);
      }
    });

    return function () {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setAdmin(null);
  }

  function terminarNuevaPassword() {
    setModoNuevaPassword(false);
  }

  return {
    user: user,
    admin: admin,
    loading: loading,
    isLoggedIn: !!user && !!admin,
    isSuperAdmin: admin && admin.nivel === 'super_admin',
    logout: logout,
    modoNuevaPassword: modoNuevaPassword,
    terminarNuevaPassword: terminarNuevaPassword,
  };
}
