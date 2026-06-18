import { useState } from 'react';
import { Loader2, AlertCircle, Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import InBodyLogo from '../InBodyLogo.jsx';

export default function LoginScreen() {
  const [mode, setMode] = useState('password'); // password | magic
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);

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

  async function handleMagicLink(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: window.location.origin + '/inbody-admin' },
      });
      if (err) throw err;
      setMagicSent(true);
    } catch (err) {
      setError(err.message);
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
          {magicSent ? (
            <div className="text-center py-4">
              <Mail className="w-10 h-10 text-inbody-red mx-auto mb-3" />
              <h2 className="font-display text-xl font-medium text-neutral-900 mb-2">Revisa tu correo</h2>
              <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                Te mandamos un enlace mágico a <strong>{email}</strong>. Dale clic para iniciar sesión.
              </p>
              <button
                type="button"
                onClick={function () { setMagicSent(false); setMode('password'); }}
                className="text-xs text-inbody-red hover:underline"
              >
                Volver al login
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-medium text-neutral-900 mb-1">
                {mode === 'password' ? 'Iniciar sesión' : 'Recuperar acceso'}
              </h2>
              <p className="text-xs text-neutral-500 mb-5">
                {mode === 'password' ? 'Acceso solo para administradores autorizados.' : 'Te mandaremos un enlace mágico al correo.'}
              </p>

              <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-3">
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

                {mode === 'password' && (
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
                )}

                {error && (
                  <div className="p-3 bg-inbody-red-soft border border-inbody-red/20 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-inbody-red flex-shrink-0 mt-0.5" />
                    <div className="text-[11px] text-inbody-red-dark">{error}</div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || (mode === 'password' && !password)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-inbody-red hover:bg-inbody-red-hover text-white text-sm font-semibold transition-all disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      {mode === 'password' ? <Lock className="w-3.5 h-3.5" /> : <KeyRound className="w-3.5 h-3.5" />}
                      {mode === 'password' ? 'Entrar' : 'Enviar enlace mágico'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={function () { setMode(mode === 'password' ? 'magic' : 'password'); setError(''); }}
                  className="text-[11px] text-neutral-500 hover:text-inbody-red transition-colors"
                >
                  {mode === 'password' ? '¿Olvidaste tu contraseña? Usar enlace mágico' : 'Volver a contraseña'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6 text-[11px] text-neutral-400">
          Si necesitas acceso, contacta al administrador del directorio.
        </div>
      </div>
    </div>
  );
}
