import { useState } from 'react';
import { Loader2, KeyRound, Mail, Shield, User, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cambiarPassword } from '../../lib/adminApi.js';

export default function MiCuentaView({ admin, user }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await cambiarPassword(newPassword);
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(function () { setSuccess(false); }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight">
          Mi cuenta
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Información de tu cuenta y opciones de seguridad.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-7 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-inbody-red to-inbody-red-dark flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
            {(admin.nombre || admin.email).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl font-medium text-neutral-900 leading-tight">
              {admin.nombre || 'Sin nombre'}
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
              {admin.nivel === 'super_admin' ? (
                <>
                  <Shield className="w-3 h-3" />
                  Super Administrador
                </>
              ) : (
                <>
                  <User className="w-3 h-3" />
                  Administrador
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-neutral-700">
          <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Correo" value={admin.email} />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-inbody-red-soft text-inbody-red flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-medium text-neutral-900">Cambiar contraseña</h2>
            <p className="text-xs text-neutral-500">Mínimo 8 caracteres</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Nueva contraseña <span className="text-inbody-red">*</span>
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={function (e) { setNewPassword(e.target.value); }}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                className="w-full pr-10 px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm outline-none font-mono"
              />
              <button
                type="button"
                onClick={function () { setShowPass(!showPass); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Confirmar nueva contraseña <span className="text-inbody-red">*</span>
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={function (e) { setConfirmPassword(e.target.value); }}
              placeholder="Repite la contraseña"
              required
              minLength={8}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm outline-none font-mono"
            />
          </div>

          {error && (
            <div className="p-3 bg-inbody-red-soft border border-inbody-red/20 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-3.5 h-3.5 text-inbody-red flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-inbody-red-dark">{error}</div>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-700 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-green-800">Contraseña actualizada correctamente</div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-inbody-red text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
              Actualizar contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-neutral-100 last:border-0">
      <div className="text-neutral-400">{icon}</div>
      <div className="flex-1 flex items-center justify-between gap-3">
        <span className="text-neutral-500">{label}</span>
        <span className="text-neutral-900 font-medium">{value}</span>
      </div>
    </div>
  );
}
