import { useState } from 'react';
import { Loader2, AlertCircle, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import InBodyLogo from '../InBodyLogo.jsx';

/**
 * Pantalla que aparece cuando un administrador llega al panel por un enlace
 * de correo (recuperar contraseña o enlace mágico). Permite definir una
 * contraseña nueva SIN pedir la actual (que es justo lo que no conoce).
 *
 * Agregada en sep 2026 para arreglar el flujo de "password recovery" que
 * mandaba al home y no daba forma de cambiar la contraseña.
 */
export default function NuevaPasswordScreen({ email, onListo }) {
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: password });
      if (err) throw err;
      setOk(true);
      setTimeout(function () { onListo(); }, 1200);
    } catch (err) {
      setError(err.message || 'No se pudo guardar la contraseña.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm transition-all outline-none';

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <InBodyLogo size={36} className="mx-auto mb-3" />
          <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500 font-semibold">Panel Administrativo</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm">
          {ok ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-inbody-red mx-auto mb-3" />
              <h2 className="font-display text-xl font-medium text-neutral-900 mb-2">Contraseña guardada</h2>
              <p className="text-sm text-neutral-500">Entrando al panel...</p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-medium text-neutral-900 mb-1">Define tu nueva contraseña</h2>
              <p className="text-xs text-neutral-500 mb-5">
                Entraste con un enlace de correo{email ? <> como <strong>{email}</strong></> : null}. Elige una contraseña para tus próximos accesos.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">Nueva contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={function (e) { setPassword(e.target.value); }}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirmar}
                    onChange={function (e) { setConfirmar(e.target.value); }}
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    className={inputClass}
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
                  disabled={loading || !password || !confirmar}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-inbody-red hover:bg-inbody-red-hover text-white text-sm font-semibold transition-all disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Guardar y entrar
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={onListo}
                  className="text-[11px] text-neutral-500 hover:text-inbody-red transition-colors"
                >
                  Entrar sin cambiar la contraseña por ahora
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
