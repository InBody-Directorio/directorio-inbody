import { useState } from 'react';
import { Loader2, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cambiarPassword } from '../../lib/adminApi.js';

export default function MiCuentaView({ admin, user }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (newPassword.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (newPassword !== confirmPassword) return setError('Las contraseñas no coinciden.');

    setLoading(true);
    try {
      await cambiarPassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-light text-neutral-900 leading-tight">Mi cuenta</h1>
        <p className="text-sm text-neutral-500 mt-1">Información de tu sesión y cambio de contraseña.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 mb-5">
        <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-400 font-semibold mb-3">Información</div>
        <div className="space-y-2 text-sm">
          <div><span className="text-neutral-500">Nombre:</span> <strong>{admin && admin.nombre ? admin.nombre : '—'}</strong></div>
          <div><span className="text-neutral-500">Correo:</span> <strong>{user && user.email}</strong></div>
          <div><span className="text-neutral-500">Nivel:</span> <strong className="text-inbody-red">{admin && admin.nivel === 'super_admin' ? 'Super Admin' : 'Admin'}</strong></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 space-y-3">
        <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-400 font-semibold mb-1">Cambiar contraseña</div>

        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1.5">Contraseña actual</label>
          <input type="password" value={currentPassword} onChange={function (e) { setCurrentPassword(e.target.value); }} required className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1.5">Nueva contraseña</label>
          <input type="password" value={newPassword} onChange={function (e) { setNewPassword(e.target.value); }} required minLength={8} className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm outline-none" />
          <div className="mt-1 text-[10px] text-neutral-500">Mínimo 8 caracteres.</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1.5">Confirmar nueva contraseña</label>
          <input type="password" value={confirmPassword} onChange={function (e) { setConfirmPassword(e.target.value); }} required className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm outline-none" />
        </div>

        {error && (
          <div className="p-3 bg-inbody-red-soft border border-inbody-red/20 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-inbody-red flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-inbody-red-dark">{error}</div>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-green-800">Contraseña actualizada correctamente.</div>
          </div>
        )}

        <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-inbody-red hover:bg-inbody-red-hover text-white text-sm font-semibold disabled:opacity-60 transition-all">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
          Actualizar contraseña
        </button>
      </form>
    </div>
  );
}
