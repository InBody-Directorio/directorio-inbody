import { useState } from 'react';
import { Search, Clock, CheckCircle2, XCircle, MapPin, Hash } from 'lucide-react';
import { getEspecialidadLabel } from '../../config/especialidades.js';
import { getModeloLabel } from '../../config/modelos.js';

export default function ProfesionalesList({ profesionales, loading, status, onSelect, emptyMessage }) {
  const [search, setSearch] = useState('');

  const filtered = (profesionales || []).filter(function (p) {
    if (!search) return true;
    const q = search.toLowerCase();
    if ((p.nombre || '').toLowerCase().indexOf(q) !== -1) return true;
    if ((p.email || '').toLowerCase().indexOf(q) !== -1) return true;
    if ((p.especialidad || '').toLowerCase().indexOf(q) !== -1) return true;
    return false;
  });

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={function (e) { setSearch(e.target.value); }}
          placeholder="Buscar por nombre, correo o especialidad..."
          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm transition-all outline-none"
        />
      </div>

      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-150">
          {[1, 2, 3].map(function (i) {
            return (
              <div key={i} className="p-4 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-neutral-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 bg-neutral-100 rounded animate-pulse" />
                  <div className="h-2 w-1/2 bg-neutral-100 rounded animate-pulse" />
                </div>
                <div className="w-16 h-6 bg-neutral-100 rounded-full animate-pulse" />
              </div>
            );
          })}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl py-12 text-center">
          <div className="text-3xl mb-2 opacity-30">📭</div>
          <div className="text-sm text-neutral-500">{search ? 'Sin resultados para "' + search + '"' : emptyMessage}</div>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-150 overflow-hidden">
          {filtered.map(function (p) {
            const ubic = (p.ubicaciones && p.ubicaciones[0]) || null;
            const especialidad = getEspecialidadLabel(p.especialidad);
            const modelo = getModeloLabel(p.modelo_inbody);
            return (
              <button
                key={p.id}
                onClick={function () { onSelect(p); }}
                className="w-full p-4 text-left hover:bg-neutral-50 transition-colors flex items-center gap-3"
              >
                <div className="w-14 h-14 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0">
                  {p.foto_perfil_url ? (
                    <img src={p.foto_perfil_url} alt={p.nombre} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-display text-neutral-400">
                      {p.nombre ? p.nombre.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="text-sm font-medium text-neutral-900 truncate">{p.nombre}</div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="text-xs text-neutral-500 truncate">{especialidad} · {modelo}</div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-neutral-500">
                    {ubic && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        <span className="truncate">{ubic.ciudad}, {ubic.estado}</span>
                      </div>
                    )}
                    {p.numero_serie && (
                      <div className="flex items-center gap-1 text-amber-700">
                        <Hash className="w-2.5 h-2.5" />
                        <span className="font-mono">{p.numero_serie}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'pendiente') return <div className="px-1.5 py-0.5 rounded-full bg-amber-100 text-[9px] uppercase tracking-wider text-amber-800 font-semibold flex items-center gap-1"><Clock className="w-2 h-2" />Pend</div>;
  if (status === 'aprobado') return <div className="px-1.5 py-0.5 rounded-full bg-green-100 text-[9px] uppercase tracking-wider text-green-800 font-semibold flex items-center gap-1"><CheckCircle2 className="w-2 h-2" />OK</div>;
  if (status === 'rechazado') return <div className="px-1.5 py-0.5 rounded-full bg-inbody-red-soft text-[9px] uppercase tracking-wider text-inbody-red-dark font-semibold flex items-center gap-1"><XCircle className="w-2 h-2" />Rec</div>;
  return null;
}
