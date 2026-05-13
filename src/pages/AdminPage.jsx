import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import { useProfesionalesAdmin, useCountPendientes } from '../hooks/useProfesionalesAdmin.js';
import LoginScreen from '../components/admin/LoginScreen.jsx';
import AdminSidebar from '../components/admin/AdminSidebar.jsx';
import ProfesionalesList from '../components/admin/ProfesionalesList.jsx';
import ProfesionalDetailModal from '../components/admin/ProfesionalDetailModal.jsx';
import AdminsView from '../components/admin/AdminsView.jsx';
import AuditLogView from '../components/admin/AuditLogView.jsx';
import MiCuentaView from '../components/admin/MiCuentaView.jsx';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const auth = useAdminAuth();

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-6 h-6 text-inbody-red animate-spin" />
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
              <ProfesionalesView
                status="pendiente"
                title="Solicitudes pendientes"
                subtitle="Profesionales esperando revisión."
                onUpdate={refetchCount}
              />
            } />
            <Route path="/aprobados" element={
              <ProfesionalesView
                status="aprobado"
                title="Profesionales aprobados"
                subtitle="Visibles en el directorio público."
                onUpdate={refetchCount}
              />
            } />
            <Route path="/rechazados" element={
              <ProfesionalesView
                status="rechazado"
                title="Solicitudes rechazadas"
                subtitle="Puedes restaurar a pendiente si fue por error."
                onUpdate={refetchCount}
              />
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

  function handleAction() {
    refetch();
    onUpdate && onUpdate();
  }

  const emptyMessages = {
    pendiente: 'Sin solicitudes pendientes',
    aprobado: 'Sin profesionales aprobados aún',
    rechazado: 'Sin solicitudes rechazadas',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight">
          {title}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
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
