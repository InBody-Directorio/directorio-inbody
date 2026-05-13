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
  availableEstados,
  availableEspecialidades,
}) {
  const especialidadLabel = especialidad ? getEspecialidadLabel(especialidad) : '';
  const hasAnyFilter = !!(estado || especialidad || query);

  return (
    <div className="bg-white/95 backdrop-blur-xl border-b border-neutral-200/60 z-20 relative">
      <div className="px-4 md:px-6 py-3 flex items-center gap-2 md:gap-3 flex-wrap">
        <SearchInput value={query} onChange={onQueryChange} />

        <FilterDropdown
          icon={<MapPin className="w-3.5 h-3.5" />}
          label="Estado"
          value={estado}
          options={ESTADOS_MEXICO}
          availableSet={availableEstados}
          onChange={onEstadoChange}
        />

        <FilterDropdown
          icon={<Stethoscope className="w-3.5 h-3.5" />}
          label="Especialidad"
          value={especialidadLabel}
          options={ESPECIALIDADES.map(function (e) {
            return e.label;
          })}
          availableSet={availableEspecialidades
            ? new Set(
                Array.from(availableEspecialidades).map(function (id) {
                  return getEspecialidadLabel(id);
                })
              )
            : null}
          onChange={function (label) {
            if (!label) {
              onEspecialidadChange(null);
              return;
            }
            const found = ESPECIALIDADES.find(function (e) {
              return e.label === label;
            });
            onEspecialidadChange(found ? found.id : null);
          }}
        />

        {estado && (
          <ActiveChip
            label={estado}
            onRemove={function () {
              onEstadoChange(null);
            }}
          />
        )}
        {especialidadLabel && (
          <ActiveChip
            label={especialidadLabel}
            onRemove={function () {
              onEspecialidadChange(null);
            }}
          />
        )}

        {hasAnyFilter && (
          <button
            onClick={function () {
              onQueryChange('');
              onEstadoChange(null);
              onEspecialidadChange(null);
            }}
            className="text-xs text-neutral-500 hover:text-inbody-red transition-colors flex items-center gap-1 font-medium"
          >
            <X className="w-3 h-3" />
            Limpiar todo
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
        className="w-full pl-9 pr-8 py-2 bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-inbody-red/20 border border-transparent focus:border-inbody-red/30 rounded-full text-sm transition-all"
      />
      {value && (
        <button
          onClick={function () {
            onChange('');
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center transition-colors"
        >
          <X className="w-2.5 h-2.5 text-neutral-600" />
        </button>
      )}
    </div>
  );
}

function ActiveChip({ label, onRemove }) {
  return (
    <div className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-inbody-red text-white text-xs font-medium animate-fade-in shadow-sm shadow-inbody-red/20">
      <span className="max-w-[160px] truncate">{label}</span>
      <button
        onClick={onRemove}
        className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}

function FilterDropdown({ icon, label, value, options, availableSet, onChange }) {
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
          (value
            ? 'bg-inbody-red-soft text-inbody-red-dark border-inbody-red/30'
            : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50')
        }
      >
        {icon}
        <span>{label}</span>
        <ChevronDown
          className={'w-3 h-3 transition-transform ' + (open ? 'rotate-180' : '')}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-[1000] min-w-[240px] max-h-[340px] overflow-y-auto">
          {options.map(function (opt) {
            const disabled =
              availableSet !== null && availableSet !== undefined && !availableSet.has(opt);
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                onClick={function () {
                  if (disabled) return;
                  onChange(isSelected ? null : opt);
                  setOpen(false);
                }}
                disabled={disabled}
                className={
                  'w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between ' +
                  (disabled
                    ? 'text-neutral-300 cursor-not-allowed bg-neutral-50/40'
                    : isSelected
                    ? 'text-inbody-red font-medium bg-inbody-red-soft/30 hover:bg-inbody-red-soft/50'
                    : 'text-neutral-700 hover:bg-neutral-50')
                }
              >
                <span>{opt}</span>
                {disabled && (
                  <span className="text-[9px] uppercase tracking-wider text-neutral-300 font-medium">
                    Sin datos
                  </span>
                )}
                {isSelected && !disabled && (
                  <span className="text-inbody-red">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
