import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Trash2, Shield, User, Loader2, AlertCircle, CheckCircle2, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { crearAdmin, eliminarAdmin } from '../../lib/adminApi.js';

export default function AdminsView({ currentAdmin }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(null);

  const fetchAdmins = useCallback(async function () {
    setLoading(true);
    try {
      const { data } = await supabase.from('admins').select('*').order('created_at', { ascending: false });
      setAdmins(data || []);
    } catch (err) {
      console.error('Error cargando admins:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(function () {
    fetchAdmins();
  }, [fetchAdmins]);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight">
            Administradores
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gestiona quién tiene acceso al panel administrativo.
          </p>
        </div>
        <button
          onClick={function () { setShowCreate(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 hover:bg-inbody-red text-white text-sm font-medium transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Agregar
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
          <Loader2 className="w-5 h-5 text-neutral-400 animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100">
          {admins.map(function (a) {
            return (
              <AdminRow
                key={a.id}
                admin={a}
                isCurrentUser={a.email.toLowerCase() === currentAdmin.email.toLowerCase()}
                onDelete={function () { setShowDelete(a); }}
              />
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateAdminModal
          onClose={function () { setShowCreate(false); }}
          onCreated={function () {
            setShowCreate(false);
            fetchAdmins();
          }}
        />
      )}

      {showDelete && (
        <DeleteAdminModal
          admin={showDelete}
          onClose={function () { setShowDelete(null); }}
          onDeleted={function () {
            setShowDelete(null);
            fetchAdmins();
          }}
        />
      )}
    </div>
  );
}

function AdminRow({ admin, isCurrentUser, onDelete }) {
  return (
    <div className="p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-inbody-red to-inbody-red-dark flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
        {(admin.nombre || admin.email).charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="text-sm font-medium text-neutral-900 truncate">
            {admin.nombre || admin.email}
          </div>
          {isCurrentUser && (
            <span className="text-[9px] uppercase tracking-wider text-inbody-red font-semibold bg-inbody-red-soft px-2 py-0.5 rounded-full">Tú</span>
          )}
        </div>
        <div className="text-xs text-neutral-500 truncate">{admin.email}</div>
      </div>
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-100 text-[10px] font-semibold uppercase tracking-wider text-neutral-700">
        {admin.nivel === 'super_admin' ? (
          <>
            <Shield className="w-2.5 h-2.5" />
            Super
          </>
        ) : (
          <>
            <User className="w-2.5 h-2.5" />
            Admin
          </>
        )}
      </div>
      {!isCurrentUser && (
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-full hover:bg-inbody-red-soft text-neutral-400 hover:text-inbody-red flex items-center justify-center transition-colors"
          title="Eliminar admin"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function CreateAdminModal({ onClose, onCreated }) {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [nivel, setNivel] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 14; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pwd += '!';
    setPassword(pwd);
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await crearAdmin(email.toLowerCase().trim(), password, nombre.trim() || null, nivel);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />
      <form onClick={function (e) { e.stopPropagation(); }} onSubmit={handleSubmit} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-neutral-150 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-1">Nuevo administrador</div>
            <h3 className="font-display text-xl font-medium text-neutral-900">Agregar admin</h3>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center">
            <X className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">Correo electrónico <span className="text-inbody-red">*</span></label>
            <input
              type="email"
              value={email}
              onChange={function (e) { setEmail(e.target.value); }}
              placeholder="admin@correo.com"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-neutral-700">Nombre <span className="text-[10px] uppercase tracking-wider text-neutral-400 ml-1">Opcional</span></label>
            </div>
            <input
              type="text"
              value={nombre}
              onChange={function (e) { setNombre(e.target.value); }}
              placeholder="María Hernández"
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">Nivel <span className="text-inbody-red">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={function () { setNivel('admin'); }}
                className={'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ' + (nivel === 'admin' ? 'border-inbody-red bg-inbody-red-soft text-inbody-red-dark font-medium' : 'border-neutral-200 hover:border-neutral-300 text-neutral-700')}
              >
                <User className="w-3.5 h-3.5" />
                Admin
              </button>
              <button
                type="button"
                onClick={function () { setNivel('super_admin'); }}
                className={'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ' + (nivel === 'super_admin' ? 'border-inbody-red bg-inbody-red-soft text-inbody-red-dark font-medium' : 'border-neutral-200 hover:border-neutral-300 text-neutral-700')}
              >
                <Shield className="w-3.5 h-3.5" />
                Super Admin
              </button>
            </div>
            <div className="mt-1.5 text-[11px] text-neutral-500">
              {nivel === 'admin' ? 'Puede aprobar/rechazar profesionales. No puede gestionar admins.' : 'Puede hacer todo, incluido agregar/quitar admins.'}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-neutral-700">Contraseña inicial <span className="text-inbody-red">*</span></label>
              <button type="button" onClick={generatePassword} className="text-[11px] text-inbody-red hover:underline">Generar segura</button>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={function (e) { setPassword(e.target.value); }}
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
            <div className="mt-1.5 text-[11px] text-neutral-500">
              El admin recibirá las credenciales por correo. Recomiéndale cambiarla al entrar.
            </div>
          </div>

          {error && (
            <div className="p-3 bg-inbody-red-soft border border-inbody-red/20 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-3.5 h-3.5 text-inbody-red flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-inbody-red-dark">{error}</div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-neutral-150 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 rounded-full text-sm text-neutral-700 hover:bg-neutral-100">
            Cancelar
          </button>
          <button type="submit" disabled={loading || !email || !password || password.length < 8} className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-neutral-900 hover:bg-inbody-red text-white text-sm font-semibold transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            Crear admin
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteAdminModal({ admin, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setLoading(true);
    setError('');
    try {
      await eliminarAdmin(admin.id);
      onDeleted();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />
      <div onClick={function (e) { e.stopPropagation(); }} className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6">
        <div className="w-12 h-12 rounded-full bg-inbody-red-soft border border-inbody-red/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-inbody-red" />
        </div>
        <h3 className="font-display text-xl font-medium text-neutral-900 text-center mb-2">Eliminar administrador</h3>
        <p className="text-sm text-neutral-500 text-center leading-relaxed mb-5">
          ¿Estás seguro que quieres eliminar a <strong className="text-neutral-900">{admin.nombre || admin.email}</strong>? Perderá acceso al panel inmediatamente.
        </p>
        {error && (
          <div className="mb-4 p-3 bg-inbody-red-soft border border-inbody-red/20 rounded-xl text-[11px] text-inbody-red-dark text-center">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2.5 rounded-full bg-white border border-neutral-200 hover:bg-neutral-50 text-sm font-medium text-neutral-700">
            Cancelar
          </button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-inbody-red hover:bg-inbody-red-hover text-white text-sm font-semibold disabled:opacity-60">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
