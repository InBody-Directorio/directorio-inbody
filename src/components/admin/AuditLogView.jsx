import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, RotateCcw, UserPlus, Trash2, Lock, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

const ACCION_ICONS = {
  aprobar_profesional: { icon: CheckCircle2, color: 'text-green-600' },
  rechazar_profesional: { icon: XCircle, color: 'text-inbody-red' },
  restaurar_profesional: { icon: RotateCcw, color: 'text-neutral-700' },
  crear_admin: { icon: UserPlus, color: 'text-neutral-900' },
  eliminar_admin: { icon: Trash2, color: 'text-inbody-red' },
  cambiar_password: { icon: Lock, color: 'text-neutral-700' },
};

const ACCION_LABELS = {
  aprobar_profesional: 'Aprobó profesional',
  rechazar_profesional: 'Rechazó profesional',
  restaurar_profesional: 'Restauró a pendiente',
  crear_admin: 'Creó administrador',
  eliminar_admin: 'Eliminó administrador',
  cambiar_password: 'Cambió contraseña',
};

export default function AuditLogView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(100);
    setLogs(data || []);
    setLoading(false);
  }

  useEffect(function () {
    load();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-light text-neutral-900 leading-tight">Audit log</h1>
        <p className="text-sm text-neutral-500 mt-1">Últimas 100 acciones del panel administrativo.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-5 h-5 text-inbody-red animate-spin mx-auto" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl py-12 text-center">
          <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <div className="text-sm text-neutral-500">Sin actividad registrada aún.</div>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-150 overflow-hidden">
          {logs.map(function (log) {
            const config = ACCION_ICONS[log.accion] || { icon: FileText, color: 'text-neutral-500' };
            const Icon = config.icon;
            const label = ACCION_LABELS[log.accion] || log.accion;
            const detalles = log.detalles || {};
            return (
              <div key={log.id} className="p-4 flex items-start gap-3">
                <div className={'w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center flex-shrink-0 ' + config.color}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-neutral-900">{label}</div>
                  {detalles.nombre && (
                    <div className="text-xs text-neutral-500 truncate">
                      {detalles.nombre} {detalles.email ? '· ' + detalles.email : ''}
                    </div>
                  )}
                  {detalles.motivo && (
                    <div className="text-[11px] text-inbody-red mt-1">Motivo: {detalles.motivo}</div>
                  )}
                  <div className="text-[10px] text-neutral-400 mt-1">
                    {log.admin_email} · {formatDate(log.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
