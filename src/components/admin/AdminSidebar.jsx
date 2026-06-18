import { NavLink } from 'react-router-dom';
import { Inbox, CheckCircle2, XCircle, Users, FileText, User, LogOut } from 'lucide-react';
import InBodyLogo from '../InBodyLogo.jsx';

export default function AdminSidebar({ admin, pendientesCount, onLogout }) {
  const isSuperAdmin = admin && admin.nivel === 'super_admin';

  return (
    <aside className="w-56 md:w-64 bg-white border-r border-neutral-200 flex flex-col flex-shrink-0 min-h-screen">
      <div className="p-5 border-b border-neutral-200">
        <div className="flex items-center gap-2.5">
          <InBodyLogo size={22} />
          <div>
            <div className="text-[9px] uppercase tracking-[0.14em] text-neutral-500 font-semibold leading-tight">Panel</div>
            <div className="text-[9px] uppercase tracking-[0.14em] text-neutral-900 font-semibold leading-tight">Administrativo</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-neutral-400 font-semibold">Profesionales</div>
        <NavItem to="/inbody-admin/pendientes" icon={Inbox} label="Pendientes" badge={pendientesCount} />
        <NavItem to="/inbody-admin/aprobados" icon={CheckCircle2} label="Aprobados" />
        <NavItem to="/inbody-admin/rechazados" icon={XCircle} label="Rechazados" />

        {isSuperAdmin && (
          <>
            <div className="px-3 py-2 mt-3 text-[9px] uppercase tracking-[0.14em] text-neutral-400 font-semibold">Sistema</div>
            <NavItem to="/inbody-admin/administradores" icon={Users} label="Administradores" />
            <NavItem to="/inbody-admin/audit-log" icon={FileText} label="Audit log" />
          </>
        )}
      </nav>

      <div className="p-3 border-t border-neutral-200 space-y-0.5">
        <NavItem to="/inbody-admin/mi-cuenta" icon={User} label="Mi cuenta" />
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-700 hover:bg-inbody-red-soft hover:text-inbody-red transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar sesión
        </button>
        {admin && (
          <div className="px-3 pt-2 text-[10px] text-neutral-400 leading-tight border-t border-neutral-100 mt-2">
            <div className="font-medium text-neutral-700 truncate">{admin.email}</div>
            <div className="uppercase tracking-wider text-inbody-red">{admin.nivel === 'super_admin' ? 'Super Admin' : 'Admin'}</div>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavItem({ to, icon: Icon, label, badge }) {
  return (
    <NavLink
      to={to}
      end
      className={function (state) {
        return 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ' +
          (state.isActive
            ? 'bg-inbody-red-soft text-inbody-red font-semibold'
            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900');
      }}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <span className="text-[10px] font-bold bg-inbody-red text-white px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
    </NavLink>
  );
}
