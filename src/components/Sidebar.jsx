import { Loader2, MapPinOff } from 'lucide-react';
import ProfesionalCard from './ProfesionalCard.jsx';

export default function Sidebar({ profesionales, loading, selectedId, onSelect }) {
  return (
    <aside className="w-[380px] flex-shrink-0 bg-white border-r border-neutral-200 flex flex-col h-full">
      <div className="px-5 py-4 border-b border-neutral-150 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
            Resultados
          </div>
          <div className="text-sm font-medium text-neutral-900">
            {loading ? 'Cargando...' : profesionales.length + ' profesional' + (profesionales.length === 1 ? '' : 'es')}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-neutral-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : profesionales.length === 0 ? (
          <EmptyState />
        ) : (
          profesionales.map(function (prof) {
            const ubic = (prof.ubicaciones || [])[0];
            return (
              <ProfesionalCard
                key={prof.id}
                profesional={prof}
                ubicacion={ubic}
                isSelected={selectedId === prof.id}
                onClick={function () {
                  onSelect(prof, ubic);
                }}
              />
            );
          })
        )}
      </div>
    </aside>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <MapPinOff className="w-5 h-5 text-neutral-400" />
      </div>
      <div className="text-sm font-medium text-neutral-900 mb-1">
        Sin resultados
      </div>
      <div className="text-xs text-neutral-500 leading-relaxed">
        Ajusta los filtros o limpia la búsqueda para ver más profesionales.
      </div>
    </div>
  );
}
