import { useState } from 'react';
import { Loader2, Lock, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import InBodyLogo from '../InBodyLogo.jsx';
import { useAdminAuth } from '../../hooks/useAdminAuth.js';

export default function LoginScreen() {
  const { login, requestPasswordReset, error } = useAdminAuth();
  const [mode, setMode] = useState('login'); // login | reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setLocalError('');
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) setLocalError(result.error || 'Error de autenticación');
  }

  async function handleReset(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setLocalError('');
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (result.ok) {
      setResetSent(true);
    } else {
      setLocalError(result.error || 'Error enviando correo');
    }
  }

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <InBodyLogo size={32} className="text-inbody-red" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 font-semibold mb-2">
            Panel Administrativo
          </div>
          <h1 className="font-display text-3xl font-light tracking-tight text-neutral-900 leading-tight">
            {mode === 'login' ? (
              <>Bienvenido <em className="italic text-inbody-red">de vuelta</em></>
            ) : (
              <>Recuperar <em className="italic text-inbody-red">contraseña</em></>
            )}
          </h1>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-7 md:p-8 shadow-sm">
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={function (e) { setEmail(e.target.value.toLowerCase().trim()); }}
                    placeholder="tu@correo.com"
                    required
                    autoFocus
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-neutral-200 hover:border-neutral-300 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={function (e) { setPassword(e.target.value); }}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-neutral-200 hover:border-neutral-300 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm transition-all outline-none"
                  />
                </div>
              </div>

              {displayError && (
                <div className="p-3 bg-inbody-red-soft border border-inbody-red/20 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-3.5 h-3.5 text-inbody-red flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] text-inbody-red-dark leading-relaxed">
                    {displayError}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 hover:bg-inbody-red text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar al panel'
                )}
              </button>

              <button
                type="button"
                onClick={function () {
                  setMode('reset');
                  setLocalError('');
                  setResetSent(false);
                }}
                className="w-full text-center text-xs text-neutral-500 hover:text-inbody-red transition-colors pt-2"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          )}

          {mode === 'reset' && !resetSent && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-xs text-neutral-500 leading-relaxed">
                Ingresa tu correo registrado y te enviaremos un link para restablecer tu contraseña.
              </p>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={function (e) { setEmail(e.target.value.toLowerCase().trim()); }}
                    placeholder="tu@correo.com"
                    required
                    autoFocus
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-neutral-200 hover:border-neutral-300 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm transition-all outline-none"
                  />
                </div>
              </div>

              {displayError && (
                <div className="p-3 bg-inbody-red-soft border border-inbody-red/20 rounded-xl text-[11px] text-inbody-red-dark">
                  {displayError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 hover:bg-inbody-red text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviarme link de recuperación'
                )}
              </button>

              <button
                type="button"
                onClick={function () { setMode('login'); setLocalError(''); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors pt-2"
              >
                <ArrowLeft className="w-3 h-3" />
                Volver al login
              </button>
            </form>
          )}

          {mode === 'reset' && resetSent && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-inbody-red-soft to-white border border-inbody-red/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-inbody-red" strokeWidth={1.5} />
              </div>
              <div className="font-display text-xl font-light text-neutral-900 mb-2">
                Revisa tu correo
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed mb-6 max-w-xs mx-auto">
                Te enviamos un link a <strong className="text-neutral-900 break-all">{email}</strong>. Haz clic en el link para restablecer tu contraseña.
              </p>
              <button
                type="button"
                onClick={function () {
                  setMode('login');
                  setResetSent(false);
                  setLocalError('');
                }}
                className="text-xs text-inbody-red hover:underline font-medium"
              >
                Volver al login
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-[10px] text-neutral-400">
          Acceso restringido a personal autorizado
        </div>
      </div>
    </div>
  );
}
