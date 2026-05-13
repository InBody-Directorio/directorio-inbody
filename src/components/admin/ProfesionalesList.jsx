import { useState, useMemo } from 'react';
import { Search, X, Inbox, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { getEspecialidadLabel } from '../../config/especialidades.js';
import { getModeloLabel } from '../../config/modelos.js';

export default function ProfesionalesList({ profesionales, loading, status, onSelect, emptyMessage }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(function () {
    if (!query) return profesionales;
    const q = query.toLowerCase();
    return profesionales.filter(function (p) {
      return (
        (p.nombre || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        getEspecialidadLabel(p.especialidad).toLowerCase().includes(q)
      );
    });
  }, [profesionales, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={function (e) { setQuery(e.target.value); }}
          placeholder="Buscar por nombre, correo o especialidad..."
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-neutral-200 hover:border-neutral-300 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm transition-all outline-none"
        />
        {query && (
          <button
            onClick={function () { setQuery(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center"
          >
            <X className="w-2.5 h-2.5 text-neutral-600" />
          </button>
        )}
      </div>

      {loading ? (
        <ListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState query={query} emptyMessage={emptyMessage} />
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100">
          {filtered.map(function (p) {
            return <ProfRow key={p.id} prof={p} onClick={function () { onSelect(p); }} />;
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="text-xs text-neutral-400 text-center tabular-nums">
          {filtered.length} de {profesionales.length} {profesionales.length === 1 ? 'profesional' : 'profesionales'}
        </div>
      )}
    </div>
  );
}

function ProfRow({ prof, onClick }) {
  const especialidad = getEspecialidadLabel(prof.especialidad);
  const modelo = getModeloLabel(prof.modelo_inbody);
  const ubic = (prof.ubicaciones && prof.ubicaciones[0]) || null;
  const foto = prof.foto_perfil_url;
  const fechaRecibida = prof.created_at ? new Date(prof.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <button
      onClick={onClick}
      className="w-full p-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors text-left group"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {foto ? (
          <img src={foto} alt={prof.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="text-base font-semibold text-neutral-400">{prof.nombre ? prof.nombre.charAt(0).toUpperCase() : '?'}</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-neutral-900 leading-tight truncate">{prof.nombre}</div>
        <div className="text-xs text-neutral-500 mb-1">{especialidad} · {modelo}</div>
        <div className="flex items-center gap-3 text-[11px] text-neutral-400">
          {ubic && (
            <span className="truncate max-w-[160px]">{ubic.ciudad}, {ubic.estado}</span>
          )}
          <span>{fechaRecibida}</span>
        </div>
      </div>

      <StatusPill status={prof.status} />
      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors flex-shrink-0" />
    </button>
  );
}

function StatusPill({ status }) {
  if (status === 'pendiente') {
    return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[10px] font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />Pendiente</span>;
  }
  if (status === 'aprobado') {
    return <span className="px-2 py-0.5 rounded-full bg-green-100 text-[10px] font-semibold uppercase tracking-wider text-green-800 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" />Aprobado</span>;
  }
  if (status === 'rechazado') {
    return <span className="px-2 py-0.5 rounded-full bg-inbody-red-soft text-[10px] font-semibold uppercase tracking-wider text-inbody-red-dark flex items-center gap-1"><XCircle className="w-2.5 h-2.5" />Rechazado</span>;
  }
  return null;
}

function ListSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-100">
      {[1, 2, 3].map(function (i) {
        return (
          <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-neutral-150" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/5 bg-neutral-150 rounded" />
              <div className="h-2.5 w-1/2 bg-neutral-150 rounded" />
              <div className="h-2 w-1/3 bg-neutral-150 rounded" />
            </div>
            <div className="w-16 h-5 bg-neutral-150 rounded-full" />
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ query, emptyMessage }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
      <div className="w-12 h-12 rounded-full bg-neutral-100 mx-auto mb-4 flex items-center justify-center">
        <Inbox className="w-5 h-5 text-neutral-400" />
      </div>
      <div className="text-sm font-medium text-neutral-900 mb-1">
        {query ? 'Sin resultados' : (emptyMessage || 'Sin profesionales')}
      </div>
      <div className="text-xs text-neutral-500">
        {query ? 'No encontramos profesionales con ese criterio.' : 'Cuando lleguen solicitudes aparecerán aquí.'}
      </div>
    </div>
  );
}
