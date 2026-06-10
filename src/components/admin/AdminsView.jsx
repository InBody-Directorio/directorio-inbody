import { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, ShieldCheck, Loader2, AlertCircle, Check, Copy, X } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { crearAdmin, eliminarAdmin } from '../../lib/adminApi.js';

export default function AdminsView({ currentAdmin }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function loadAdmins() {
    setLoading(true);
    const { data } = await supabase.from('admins').select('*').order('created_at', { ascending: true });
    setAdmins(data || []);
    setLoading(false);
  }

  useEffect(function () {
    loadAdmins();
  }, []);

  async function handleDelete(adminId) {
    try {
      await eliminarAdmin(adminId);
      setConfirmDelete(null);
      loadAdmins();
    } catch (err) {
      alert('Error eliminando: ' + err.message);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-light text-neutral-900 leading-tight">Administradores</h1>
          <p className="text-sm text-neutral-500 mt-1">Gestiona quién tiene acceso al panel.</p>
        </div>
        <button
          onClick={function () { setShowModal(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-inbody-red hover:bg-inbody-red-hover text-white text-xs font-semibold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar admin
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-5 h-5 text-inbody-red animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-150 overflow-hidden">
          {admins.map(function (a) {
            const isSuper = a.nivel === 'super_admin';
            const isMe = currentAdmin && currentAdmin.id === a.id;
            return (
              <div key={a.id} className="p-4 flex items-center gap-3">
                <div className={'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ' + (isSuper ? 'bg-inbody-red text-white' : 'bg-neutral-100 text-neutral-600')}>
                  {isSuper ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-neutral-900 truncate">{a.nombre || a.email}</div>
                    {isMe && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 uppercase tracking-wider font-semibold">Tú</span>}
                  </div>
                  <div className="text-xs text-neutral-500 truncate">{a.email}</div>
                  <div className="text-[10px] uppercase tracking-wider text-inbody-red font-semibold mt-0.5">
                    {isSuper ? 'Super Admin' : 'Admin'}
                  </div>
                </div>
                {!isMe && (
                  <button
                    onClick={function () { setConfirmDelete(a); }}
                    className="w-8 h-8 rounded-full hover:bg-inbody-red-soft text-neutral-400 hover:text-inbody-red flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CrearAdminModal
          onClose={function () { setShowModal(false); }}
          onCreated={function (data) {
            setNewAdminData(data);
            setShowModal(false);
            loadAdmins();
          }}
        />
      )}

      {newAdminData && (
        <CredencialesModal data={newAdminData} onClose={function () { setNewAdminData(null); }} />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          admin={confirmDelete}
          onConfirm={function () { handleDelete(confirmDelete.id); }}
          onCancel={function () { setConfirmDelete(null); }}
        />
      )}
    </div>
  );
}

function CrearAdminModal({ onClose, onCreated }) {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [nivel, setNivel] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await crearAdmin(email.trim().toLowerCase(), nombre.trim(), nivel);
      onCreated({ email: result.email, password: result.password, nombre: nombre });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />
      <div onClick={function (e) { e.stopPropagation(); }} className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-medium text-neutral-900">Nuevo administrador</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">Nombre</label>
            <input type="text" value={nombre} onChange={function (e) { setNombre(e.target.value); }} placeholder="Nombre completo" className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm outline-none" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">Correo</label>
            <input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} placeholder="correo@inbodymexico.com" className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm outline-none" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">Nivel</label>
            <select value={nivel} onChange={function (e) { setNivel(e.target.value); }} className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm outline-none">
              <option value="admin">Admin (revisa solicitudes)</option>
              <option value="super_admin">Super Admin (acceso total)</option>
            </select>
          </div>
          {error && (
            <div className="p-3 bg-inbody-red-soft border border-inbody-red/20 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-inbody-red flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-inbody-red-dark">{error}</div>
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-inbody-red hover:bg-inbody-red-hover text-white text-sm font-semibold disabled:opacity-60 transition-all">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Crear administrador
          </button>
        </form>
      </div>
    </div>
  );
}

function CredencialesModal({ data, onClose }) {
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    const text = 'Correo: ' + data.email + '\nContraseña: ' + data.password;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(function () { setCopied(false); }, 2000);
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="font-display text-xl font-medium text-neutral-900 mb-1">Administrador creado</h2>
          <p className="text-xs text-neutral-500">Guarda estas credenciales y compártelas con {data.nombre}.</p>
        </div>
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-4 font-mono text-xs">
          <div className="mb-2"><span className="text-neutral-500">Correo:</span> <strong className="text-neutral-900">{data.email}</strong></div>
          <div><span className="text-neutral-500">Contraseña:</span> <strong className="text-inbody-red">{data.password}</strong></div>
        </div>
        <button onClick={copyToClipboard} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-inbody-red text-white text-sm font-medium transition-all mb-2">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? '¡Copiado!' : 'Copiar credenciales'}
        </button>
        <button onClick={onClose} className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ admin, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />
      <div onClick={function (e) { e.stopPropagation(); }} className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <h2 className="font-display text-xl font-medium text-neutral-900 mb-2">¿Eliminar administrador?</h2>
        <p className="text-sm text-neutral-600 leading-relaxed mb-5">
          Vas a quitarle el acceso a <strong>{admin.email}</strong>. Esta acción no se puede deshacer.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-full text-sm text-neutral-700 hover:bg-neutral-100 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-5 py-2 rounded-full bg-inbody-red hover:bg-inbody-red-hover text-white text-sm font-semibold transition-all">Eliminar</button>
        </div>
      </div>
    </div>
  );
}
