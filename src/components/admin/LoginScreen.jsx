import { useState } from 'react';
import { Loader2, AlertCircle, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import InBodyLogo from '../InBodyLogo.jsx';

export default function LoginScreen() {
  // Sep 2026: se quitó el "enlace mágico" del login. La recuperación de
  // contraseña la manda un administrador desde Supabase (Authentication →
  // Users → Send password recovery) y el enlace abre NuevaPasswordScreen.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });
      if (err) throw err;
      // El hook useAdminAuth se encarga del redirect
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <InBodyLogo size={36} className="mx-auto mb-3" />
          <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500 font-semibold">Panel Administrativo</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="font-display text-xl font-medium text-neutral-900 mb-1">Iniciar sesión</h2>
              <p className="text-xs text-neutral-500 mb-5">Acceso solo para administradores autorizados.</p>

              <form onSubmit={handlePasswordLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">Correo</label>
                  <input
                    type="email"
                    value={email}
                    onChange={function (e) { setEmail(e.target.value); }}
                    placeholder="tu@correo.com"
                    autoComplete="username"
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={function (e) { setPassword(e.target.value); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm transition-all outline-none"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-inbody-red-soft border border-inbody-red/20 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-inbody-red flex-shrink-0 mt-0.5" />
                    <div className="text-[11px] text-inbody-red-dark">{error}</div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-inbody-red hover:bg-inbody-red-hover text-white text-sm font-semibold transition-all disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Entrar
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center text-[11px] text-neutral-500">
                ¿Olvidaste tu contraseña? Pide a un administrador que te envíe el enlace de recuperación.
              </div>
        </div>

        <div className="text-center mt-6 text-[11px] text-neutral-400">
          Si necesitas acceso, contacta al administrador del directorio.
        </div>
      </div>
    </div>
  );
}
