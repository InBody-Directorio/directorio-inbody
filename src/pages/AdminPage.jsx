import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Loader2, RefreshCw, Download } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import { useProfesionalesAdmin, useCountPendientes } from '../hooks/useProfesionalesAdmin.js';
import LoginScreen from '../components/admin/LoginScreen.jsx';
import AdminSidebar from '../components/admin/AdminSidebar.jsx';
import ProfesionalesList from '../components/admin/ProfesionalesList.jsx';
import ProfesionalDetailModal from '../components/admin/ProfesionalDetailModal.jsx';
import AdminsView from '../components/admin/AdminsView.jsx';
import AuditLogView from '../components/admin/AuditLogView.jsx';
import MiCuentaView from '../components/admin/MiCuentaView.jsx';
import { profesionalesToCSV, downloadCSV } from '../lib/exportCSV.js';

export default function AdminPage() {
  const auth = useAdminAuth();

  if (auth.loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 gap-3">
        <Loader2 className="w-6 h-6 text-inbody-red animate-spin" />
        <div className="text-xs text-neutral-400">Verificando sesión...</div>
      </div>
    );
  }

  if (!auth.isLoggedIn) {
    return <LoginScreen />;
  }

  return <AdminApp auth={auth} />;
}

function AdminApp({ auth }) {
  const { count: pendientesCount, refetch: refetchCount } = useCountPendientes();

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <AdminSidebar
        admin={auth.admin}
        pendientesCount={pendientesCount}
        onLogout={auth.logout}
      />

      <main className="flex-1 overflow-x-hidden">
        <div className="p-6 md:p-10 max-w-5xl">
          <Routes>
            <Route path="/" element={<Navigate to="/inbody-admin/pendientes" replace />} />
            <Route path="/pendientes" element={
              <ProfesionalesView key="pendientes" status="pendiente" title="Solicitudes pendientes" subtitle="Profesionales esperando revisión." onUpdate={refetchCount} />
            } />
            <Route path="/aprobados" element={
              <ProfesionalesView key="aprobados" status="aprobado" title="Profesionales aprobados" subtitle="Visibles en el directorio público." onUpdate={refetchCount} />
            } />
            <Route path="/rechazados" element={
              <ProfesionalesView key="rechazados" status="rechazado" title="Solicitudes rechazadas" subtitle="Puedes restaurar a pendiente si fue por error." onUpdate={refetchCount} />
            } />
            {auth.isSuperAdmin && (
              <>
                <Route path="/administradores" element={<AdminsView currentAdmin={auth.admin} />} />
                <Route path="/audit-log" element={<AuditLogView />} />
              </>
            )}
            <Route path="/mi-cuenta" element={<MiCuentaView admin={auth.admin} user={auth.user} />} />
            <Route path="*" element={<Navigate to="/inbody-admin/pendientes" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function ProfesionalesView({ status, title, subtitle, onUpdate }) {
  const { profesionales, loading, refetch } = useProfesionalesAdmin(status);
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await refetch();
    if (onUpdate) onUpdate();
    setTimeout(function () { setRefreshing(false); }, 400);
  }

  function handleAction() {
    refetch();
    if (onUpdate) onUpdate();
  }

  function handleExportCSV() {
    if (!profesionales || profesionales.length === 0) return;
    setExporting(true);
    try {
      const csv = profesionalesToCSV(profesionales);
      const date = new Date().toISOString().slice(0, 10);
      const filename = 'directorio-inbody-' + status + '-' + date + '.csv';
      downloadCSV(csv, filename);
    } catch (err) {
      console.error('Error exportando CSV:', err);
    } finally {
      setTimeout(function () { setExporting(false); }, 600);
    }
  }

  const emptyMessages = {
    pendiente: 'Sin solicitudes pendientes',
    aprobado: 'Sin profesionales aprobados aún',
    rechazado: 'Sin solicitudes rechazadas',
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight">
            {title}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleExportCSV}
            disabled={exporting || loading || profesionales.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="Descargar lista como CSV"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? 'Descargando...' : 'Exportar CSV'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-all disabled:opacity-50"
            title="Actualizar lista"
          >
            <RefreshCw className={'w-3.5 h-3.5 ' + (refreshing ? 'animate-spin' : '')} />
            Refrescar
          </button>
        </div>
      </div>

      <ProfesionalesList
        profesionales={profesionales}
        loading={loading}
        status={status}
        onSelect={setSelected}
        emptyMessage={emptyMessages[status]}
      />

      {selected && (
        <ProfesionalDetailModal
          profesional={selected}
          onClose={function () { setSelected(null); }}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
