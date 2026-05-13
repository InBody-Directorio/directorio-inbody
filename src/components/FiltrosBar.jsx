import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, MapPin, Stethoscope } from 'lucide-react';
import { ESTADOS_MEXICO } from '../config/estados.js';
import { ESPECIALIDADES } from '../config/especialidades.js';

export default function FiltrosBar({
  query,
  onQueryChange,
  estado,
  onEstadoChange,
  especialidad,
  onEspecialidadChange,
  resultsCount,
}) {
  return (
    <div className="bg-white/85 backdrop-blur-md border-b border-neutral-200/70">
      <div className="px-4 md:px-6 py-3 flex items-center gap-2 md:gap-3 flex-wrap">
        <SearchInput value={query} onChange={onQueryChange} />
        <FilterDropdown
          icon={<MapPin className="w-3.5 h-3.5" />}
          label="Estado"
          value={estado}
          options={ESTADOS_MEXICO}
          onChange={onEstadoChange}
        />
        <FilterDropdown
          icon={<Stethoscope className="w-3.5 h-3.5" />}
          label="Especialidad"
          value={especialidad ? getEspecialidadLabel(especialidad) : ''}
          options={ESPECIALIDADES.map(function (e) {
            return e.label;
          })}
          onChange={function (label) {
            const found = ESPECIALIDADES.find(function (e) {
              return e.label === label;
            });
            onEspecialidadChange(found ? found.id : null);
          }}
        />
        {(estado || especialidad || query) && (
          <button
            onClick={function () {
              onQueryChange('');
              onEstadoChange(null);
              onEspecialidadChange(null);
            }}
            className="text-xs text-neutral-500 hover:text-inbody-red transition-colors flex items-center gap-1 ml-auto"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
        <div className="text-xs text-neutral-400 font-medium tabular-nums hidden md:block ml-auto">
          {resultsCount} resultado{resultsCount === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  );
}

function getEspecialidadLabel(id) {
  const found = ESPECIALIDADES.find(function (e) {
    return e.id === id;
  });
  return found ? found.label : '';
}

function SearchInput({ value, onChange }) {
  return (
    <div className="relative flex-1 min-w-[180px] max-w-[280px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
      <input
        type="text"
        value={value}
        onChange={function (e) {
          onChange(e.target.value);
        }}
        placeholder="Buscar por nombre"
        className="w-full pl-9 pr-8 py-2 bg-neutral-100 hover:bg-neutral-150 focus:bg-white focus:outline-none focus:ring-1 focus:ring-inbody-red/40 border border-transparent focus:border-inbody-red/30 rounded-full text-sm transition-all"
      />
      {value && (
        <button
          onClick={function () {
            onChange('');
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-neutral-200 hover:bg-neutral-200/70 flex items-center justify-center"
        >
          <X className="w-2.5 h-2.5 text-neutral-600" />
        </button>
      )}
    </div>
  );
}

function FilterDropdown({ icon, label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(function () {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return function () {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const active = !!value;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={function () {
          setOpen(function (o) {
            return !o;
          });
        }}
        className={
          'flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all border ' +
          (active
            ? 'bg-inbody-red-soft text-inbody-red-dark border-inbody-red/30'
            : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300')
        }
      >
        {icon}
        <span className="max-w-[140px] truncate">{value || label}</span>
        <ChevronDown
          className={'w-3 h-3 transition-transform ' + (open ? 'rotate-180' : '')}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[220px] max-h-[320px] overflow-y-auto">
          {active && (
            <button
              onClick={function () {
                onChange(null);
                setOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-inbody-red hover:bg-neutral-50 border-b border-neutral-100"
            >
              Quitar filtro
            </button>
          )}
          {options.map(function (opt) {
            return (
              <button
                key={opt}
                onClick={function () {
                  onChange(opt);
                  setOpen(false);
                }}
                className={
                  'w-full text-left px-3.5 py-2 text-xs hover:bg-neutral-50 transition-colors ' +
                  (value === opt
                    ? 'text-inbody-red font-medium bg-neutral-50'
                    : 'text-neutral-700')
                }
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
