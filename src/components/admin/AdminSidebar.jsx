import { Link, useLocation } from 'react-router-dom';
import { Inbox, CheckCircle2, XCircle, Users, FileText, LogOut, Shield, User } from 'lucide-react';
import InBodyLogo from '../InBodyLogo.jsx';

export default function AdminSidebar({ admin, pendientesCount, onLogout }) {
  const location = useLocation();
  const path = location.pathname;

  const items = [
    {
      to: '/inbody-admin/pendientes',
      label: 'Pendientes',
      icon: <Inbox className="w-4 h-4" />,
      badge: pendientesCount,
    },
    {
      to: '/inbody-admin/aprobados',
      label: 'Aprobados',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      to: '/inbody-admin/rechazados',
      label: 'Rechazados',
      icon: <XCircle className="w-4 h-4" />,
    },
  ];

  const adminItems = [
    {
      to: '/inbody-admin/administradores',
      label: 'Administradores',
      icon: <Users className="w-4 h-4" />,
      onlySuperAdmin: true,
    },
    {
      to: '/inbody-admin/audit-log',
      label: 'Audit log',
      icon: <FileText className="w-4 h-4" />,
      onlySuperAdmin: true,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-neutral-150 flex items-center gap-2.5">
        <InBodyLogo size={20} className="text-inbody-red" />
        <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 font-semibold leading-tight">
          Panel<br/>Administrativo
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold px-3 mb-2">
          Profesionales
        </div>
        <div className="space-y-0.5 mb-6">
          {items.map(function (item) {
            const active = path === item.to || (item.to === '/inbody-admin/pendientes' && path === '/inbody-admin');
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ' +
                  (active
                    ? 'bg-inbody-red-soft text-inbody-red-dark font-medium'
                    : 'text-neutral-700 hover:bg-neutral-100')
                }
              >
                <span className="flex items-center gap-2.5">
                  {item.icon}
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full bg-inbody-red text-white text-[10px] font-semibold tabular-nums">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {admin && admin.nivel === 'super_admin' && (
          <>
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold px-3 mb-2">
              Sistema
            </div>
            <div className="space-y-0.5">
              {adminItems.map(function (item) {
                const active = path === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ' +
                      (active
                        ? 'bg-inbody-red-soft text-inbody-red-dark font-medium'
                        : 'text-neutral-700 hover:bg-neutral-100')
                    }
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-neutral-150">
        <Link
          to="/inbody-admin/mi-cuenta"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100 transition-colors mb-2"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-inbody-red to-inbody-red-dark flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {admin && admin.nombre ? admin.nombre.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-neutral-900 truncate">
              {admin && admin.nombre ? admin.nombre : 'Admin'}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-neutral-500">
              {admin && admin.nivel === 'super_admin' ? (
                <>
                  <Shield className="w-2.5 h-2.5" />
                  Super Admin
                </>
              ) : (
                <>
                  <User className="w-2.5 h-2.5" />
                  Admin
                </>
              )}
            </div>
          </div>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-600 hover:bg-neutral-100 hover:text-inbody-red transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
