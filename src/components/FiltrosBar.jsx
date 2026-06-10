import { Filter, X } from 'lucide-react';
import { ESPECIALIDADES } from '../config/especialidades.js';
import { ESTADOS_MX } from '../config/estados.js';
import { MODELOS_INBODY } from '../config/modelos.js';

export default function FiltrosBar({ filters, onChange, totalResults }) {
  const hasFilters = filters.especialidad || filters.estado || filters.modelo;

  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  function clear() {
    onChange({ especialidad: '', estado: '', modelo: '' });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-wrap items-center gap-2 md:gap-3">
      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mr-1">
        <Filter className="w-3 h-3" />
        <span className="uppercase tracking-wider font-semibold">Filtros</span>
      </div>

      <select
        value={filters.especialidad}
        onChange={function (e) { update('especialidad', e.target.value); }}
        className="px-3 py-2 bg-white border border-neutral-200 hover:border-neutral-300 rounded-full text-xs text-neutral-700 cursor-pointer transition-colors outline-none focus:ring-2 focus:ring-inbody-red/20"
      >
        <option value="">Todas las categorías</option>
        {ESPECIALIDADES.map(function (e) {
          return <option key={e.id} value={e.id}>{e.label}</option>;
        })}
      </select>

      <select
        value={filters.estado}
        onChange={function (e) { update('estado', e.target.value); }}
        className="px-3 py-2 bg-white border border-neutral-200 hover:border-neutral-300 rounded-full text-xs text-neutral-700 cursor-pointer transition-colors outline-none focus:ring-2 focus:ring-inbody-red/20"
      >
        <option value="">Todos los estados</option>
        {ESTADOS_MX.map(function (e) {
          return <option key={e} value={e}>{e}</option>;
        })}
      </select>

      <select
        value={filters.modelo}
        onChange={function (e) { update('modelo', e.target.value); }}
        className="px-3 py-2 bg-white border border-neutral-200 hover:border-neutral-300 rounded-full text-xs text-neutral-700 cursor-pointer transition-colors outline-none focus:ring-2 focus:ring-inbody-red/20"
      >
        <option value="">Todos los modelos</option>
        {MODELOS_INBODY.filter(function (m) { return m.id !== 'otro'; }).map(function (m) {
          return <option key={m.id} value={m.id}>{m.label}</option>;
        })}
      </select>

      {hasFilters && (
        <button
          onClick={clear}
          className="flex items-center gap-1 px-3 py-2 text-xs text-inbody-red hover:bg-inbody-red-soft rounded-full transition-colors"
        >
          <X className="w-3 h-3" />
          Limpiar
        </button>
      )}

      <div className="ml-auto text-xs text-neutral-500">
        {totalResults} {totalResults === 1 ? 'profesional' : 'profesionales'}
      </div>
    </div>
  );
}
