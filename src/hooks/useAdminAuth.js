import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * Hook que maneja el estado de auth del admin.
 * Verifica que el usuario esté autenticado Y esté en la tabla admins.
 */
export function useAdminAuth() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAdmin = useCallback(async function (currentUser) {
    if (!currentUser) {
      setAdmin(null);
      return null;
    }

    try {
      const { data, error: dbErr } = await supabase
        .from('admins')
        .select('*')
        .ilike('email', currentUser.email)
        .maybeSingle();

      if (dbErr) throw dbErr;
      if (!data) {
        // Usuario auth válido pero NO está en tabla admins → cerrar sesión
        await supabase.auth.signOut();
        setAdmin(null);
        setUser(null);
        setError('No tienes permisos de administrador. Sesión cerrada.');
        return null;
      }
      if (!data.activo) {
        await supabase.auth.signOut();
        setAdmin(null);
        setUser(null);
        setError('Tu cuenta de administrador está desactivada.');
        return null;
      }

      setAdmin(data);
      return data;
    } catch (err) {
      console.error('Error verificando admin:', err);
      setError('Error verificando permisos: ' + err.message);
      return null;
    }
  }, []);

  useEffect(function () {
    let mounted = true;

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session && session.user) {
        setUser(session.user);
        await checkAdmin(session.user);
      }
      setLoading(false);
    }

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange(async function (event, session) {
      if (!mounted) return;
      if (session && session.user) {
        setUser(session.user);
        await checkAdmin(session.user);
      } else {
        setUser(null);
        setAdmin(null);
      }
    });

    return function () {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const login = useCallback(async function (email, password) {
    setError(null);
    const { data, error: loginErr } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (loginErr) {
      setError(loginErr.message);
      return { ok: false, error: loginErr.message };
    }
    const adminData = await checkAdmin(data.user);
    if (!adminData) {
      return { ok: false, error: 'No tienes permisos de administrador' };
    }
    return { ok: true };
  }, [checkAdmin]);

  const logout = useCallback(async function () {
    await supabase.auth.signOut();
    setUser(null);
    setAdmin(null);
  }, []);

  const requestPasswordReset = useCallback(async function (email) {
    setError(null);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/inbody-admin',
    });
    if (resetErr) {
      setError(resetErr.message);
      return { ok: false, error: resetErr.message };
    }
    return { ok: true };
  }, []);

  return {
    user,
    admin,
    loading,
    error,
    login,
    logout,
    requestPasswordReset,
    isLoggedIn: !!user && !!admin,
    isSuperAdmin: admin && admin.nivel === 'super_admin',
  };
}
