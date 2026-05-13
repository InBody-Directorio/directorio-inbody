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
    <div className="bg-white/95 backdrop-blur-xl border-b border-neutral-200/60 z-20 relative">
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
            className="text-xs text-neutral-500 hover:text-inbody-red transition-colors flex items-center gap-1"
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

function FilterDropdown({ icon, label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const buttonRef = useRef(null);

  useEffect(
    function () {
      function handleClick(e) {
        if (ref.current && !ref.current.contains(e.target)) {
          setOpen(false);
        }
      }
      function handleScroll() {
        setOpen(false);
      }
      document.addEventListener('mousedown', handleClick);
      window.addEventListener('scroll', handleScroll, true);
      return function () {
        document.removeEventListener('mousedown', handleClick);
        window.removeEventListener('scroll', handleScroll, true);
      };
    },
    []
  );

  useEffect(
    function () {
      if (open && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 6,
          left: rect.left,
        });
      }
    },
    [open]
  );

  const active = !!value;

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        onClick={function () {
          setOpen(function (o) {
            return !o;
          });
        }}
        className={
          'flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all border ' +
          (active
            ? 'bg-inbody-red-soft text-inbody-red-dark border-inbody-red/30 shadow-sm shadow-inbody-red/10'
            : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50')
        }
      >
        {icon}
        <span className="max-w-[140px] truncate">{value || label}</span>
        <ChevronDown
          className={'w-3 h-3 transition-transform ' + (open ? 'rotate-180' : '')}
        />
      </button>

      {open && (
        <div
          className="fixed bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-[1000] min-w-[240px] max-h-[340px] overflow-y-auto"
          style={{
            top: position.top + 'px',
            left: position.left + 'px',
          }}
        >
          {active && (
            <button
              onClick={function () {
                onChange(null);
                setOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 text-xs text-inbody-red hover:bg-inbody-red-soft/30 border-b border-neutral-100 font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-3 h-3" />
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
                    ? 'text-inbody-red font-medium bg-inbody-red-soft/30'
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
