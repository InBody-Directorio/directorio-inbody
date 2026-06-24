import { MapPin, Activity, Sparkles } from 'lucide-react';
import { getEspecialidadLabel } from '../config/especialidades.js';
import { getModeloLabel, isModeloDescontinuado } from '../config/modelos.js';
import ImagenModelo from './ImagenModelo.jsx';

export default function ProfesionalCard({ profesional, ubicacion, isSelected, onClick }) {
  const especialidad = getEspecialidadLabel(profesional.especialidad);
  const modelo = getModeloLabel(profesional.modelo_inbody);
  const descontinuado = isModeloDescontinuado(profesional.modelo_inbody);
  const foto = profesional.foto_perfil_url || (ubicacion && ubicacion.foto_lugar_url);

  return (
    <button
      onClick={onClick}
      className={
        'w-full text-left transition-all duration-200 group relative ' +
        (isSelected
          ? 'bg-gradient-to-r from-inbody-red-soft/40 to-transparent'
          : 'hover:bg-neutral-50')
      }
    >
      {isSelected && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-inbody-red rounded-r-full" />
      )}
      <div className="p-4 border-b border-neutral-150/70 flex gap-3 items-start">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden flex items-center justify-center">
            {foto ? (
              <img src={foto} alt={profesional.nombre} className="w-full h-full object-cover" />
            ) : (
              <Activity className="w-6 h-6 text-neutral-400" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center">
            <MapPin className="w-2.5 h-2.5 text-inbody-red" fill="currentColor" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-neutral-900 leading-tight mb-0.5 truncate">
            {profesional.nombre}
          </div>
          <div className="text-xs text-neutral-500 mb-1.5">{especialidad}</div>
          {ubicacion && (
            <div className="flex items-center gap-1 text-xs text-neutral-400 mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0 text-inbody-red/70" />
              <span className="truncate">{ubicacion.ciudad}, {ubicacion.estado}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200/60">
              <ImagenModelo modeloId={profesional.modelo_inbody} size="xs" className="!w-6 !h-6 !rounded !bg-white" />
              <span className="text-[10px] font-semibold text-neutral-700">{modelo}</span>
            </div>
            {descontinuado && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[9px] font-bold text-amber-900 uppercase tracking-wider">
                Descontinuado
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function ProfesionalCardSkeleton() {
  return (
    <div className="p-4 border-b border-neutral-150/70 flex gap-3 items-start">
      <div className="w-14 h-14 rounded-xl bg-neutral-150 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-3/4 bg-neutral-150 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-neutral-150 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-neutral-150 rounded animate-pulse" />
        <div className="h-4 w-20 bg-neutral-150 rounded animate-pulse" />
      </div>
    </div>
  );
}
