import { useState, useEffect, useCallback } from 'react';
import { Loader2, FileText, CheckCircle2, XCircle, RotateCcw, UserPlus, UserMinus, KeyRound, User } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

const ACCION_LABELS = {
  aprobar_profesional: { label: 'Aprobó profesional', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'green' },
  rechazar_profesional: { label: 'Rechazó profesional', icon: <XCircle className="w-3.5 h-3.5" />, color: 'red' },
  restaurar_profesional: { label: 'Restauró profesional', icon: <RotateCcw className="w-3.5 h-3.5" />, color: 'amber' },
  crear_admin: { label: 'Creó nuevo admin', icon: <UserPlus className="w-3.5 h-3.5" />, color: 'blue' },
  eliminar_admin: { label: 'Eliminó admin', icon: <UserMinus className="w-3.5 h-3.5" />, color: 'red' },
  cambiar_propia_password: { label: 'Cambió su contraseña', icon: <KeyRound className="w-3.5 h-3.5" />, color: 'neutral' },
  cambiar_password_otro: { label: 'Cambió contraseña de otro', icon: <KeyRound className="w-3.5 h-3.5" />, color: 'amber' },
};

export default function AuditLogView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async function () {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setLogs(data || []);
    } catch (err) {
      console.error('Error cargando audit log:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(function () {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight">
          Audit log
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Registro de las últimas 100 acciones realizadas en el panel.
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
          <Loader2 className="w-5 h-5 text-neutral-400 animate-spin mx-auto" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="text-sm font-medium text-neutral-900 mb-1">Sin actividad registrada</div>
          <div className="text-xs text-neutral-500">Las acciones de los admins aparecerán aquí.</div>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100">
          {logs.map(function (log) {
            return <LogRow key={log.id} log={log} />;
          })}
        </div>
      )}
    </div>
  );
}

function LogRow({ log }) {
  const info = ACCION_LABELS[log.accion] || { label: log.accion, icon: <FileText className="w-3.5 h-3.5" />, color: 'neutral' };
  const colorClasses = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-inbody-red-soft text-inbody-red-dark',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    neutral: 'bg-neutral-100 text-neutral-700',
  };

  const detalles = log.detalles || {};
  const targetName = detalles.nombre || detalles.email_eliminado || detalles.email || detalles.target_email || '';
  const motivo = detalles.motivo;

  return (
    <div className="p-4 flex items-start gap-3">
      <div className={'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + (colorClasses[info.color] || colorClasses.neutral)}>
        {info.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-neutral-900 leading-snug">
          <span className="font-medium">{log.admin_email}</span>
          <span className="text-neutral-500"> · {info.label.toLowerCase()}</span>
          {targetName && (
            <>
              <span className="text-neutral-400"> → </span>
              <span className="font-medium">{targetName}</span>
            </>
          )}
        </div>
        {motivo && (
          <div className="mt-1 text-[11px] text-neutral-600 leading-relaxed bg-neutral-50 px-2.5 py-1.5 rounded-lg inline-block">
            <span className="text-neutral-400">Motivo: </span>{motivo}
          </div>
        )}
        <div className="text-[10px] text-neutral-400 mt-1">{formatDate(log.created_at)}</div>
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return 'Hace unos segundos';
  if (diffMin < 60) return 'Hace ' + diffMin + ' min';
  if (diffH < 24) return 'Hace ' + diffH + ' h';
  if (diffD < 7) return 'Hace ' + diffD + ' días';
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
