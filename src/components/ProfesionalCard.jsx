import { MapPin, Sparkles, MessageCircle, Globe, ChevronRight } from 'lucide-react';
import { getEspecialidadLabel } from '../config/especialidades.js';
import { getModelo, getModeloLabel } from '../config/modelos.js';
import ImagenModelo from './ImagenModelo.jsx';

export default function ProfesionalCard({ profesional, onClick, compact = false }) {
  const especialidad = getEspecialidadLabel(profesional.especialidad);
  const modelo = getModelo(profesional.modelo_inbody);
  const modeloLabel = modelo ? modelo.label : getModeloLabel(profesional.modelo_inbody);
  const ubic = (profesional.ubicaciones && profesional.ubicaciones[0]) || null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-neutral-200 hover:border-inbody-red/30 hover:shadow-lg hover:shadow-inbody-red/5 rounded-2xl p-4 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Foto de las instalaciones */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden flex-shrink-0 relative">
          {profesional.foto_perfil_url ? (
            <img src={profesional.foto_perfil_url} alt={profesional.nombre} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-display font-light text-neutral-400">
              {profesional.nombre ? profesional.nombre.charAt(0).toUpperCase() : '?'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display text-base md:text-lg font-medium text-neutral-900 leading-tight truncate">
              {profesional.nombre}
            </h3>
            <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-inbody-red transition-colors flex-shrink-0 mt-1" />
          </div>

          <div className="text-xs text-neutral-500 mb-2 truncate">{especialidad}</div>

          {/* Modelo con miniatura - característica nueva */}
          <div className="flex items-center gap-2 mb-2">
            <ImagenModelo modeloId={profesional.modelo_inbody} size="xs" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold leading-tight">Equipo</span>
              <span className="text-xs font-medium text-inbody-red truncate leading-tight">{modeloLabel}</span>
            </div>
          </div>

          {ubic && (
            <div className="flex items-center gap-1 text-[11px] text-neutral-500">
              <MapPin className="w-2.5 h-2.5 text-inbody-red flex-shrink-0" />
              <span className="truncate">{ubic.ciudad}, {ubic.estado}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
