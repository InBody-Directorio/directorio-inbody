import { MapPin, Activity } from 'lucide-react';
import { getEspecialidadLabel } from '../config/especialidades.js';
import { getModeloLabel } from '../config/modelos.js';

export default function ProfesionalCard({ profesional, ubicacion, isSelected, onClick }) {
  const especialidad = getEspecialidadLabel(profesional.especialidad);
  const modelo = getModeloLabel(profesional.modelo_inbody);
  const foto = profesional.foto_perfil_url || (ubicacion && ubicacion.foto_lugar_url);

  return (
    <button
      onClick={onClick}
      className={
        'w-full text-left transition-all group ' +
        (isSelected
          ? 'bg-inbody-red-soft/30'
          : 'hover:bg-neutral-100/60')
      }
    >
      <div className="p-4 border-b border-neutral-150 flex gap-3 items-start">
        <div className="w-14 h-14 rounded-xl bg-neutral-150 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {foto ? (
            <img src={foto} alt={profesional.nombre} className="w-full h-full object-cover" />
          ) : (
            <Activity className="w-6 h-6 text-neutral-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="font-medium text-sm text-neutral-900 leading-tight">
              {profesional.nombre}
            </div>
          </div>
          <div className="text-xs text-neutral-500 mb-1.5">{especialidad}</div>
          {ubicacion && (
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{ubicacion.ciudad}, {ubicacion.estado}</span>
            </div>
          )}
          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 border border-neutral-200">
            {modelo}
          </div>
        </div>
      </div>
    </button>
  );
}
