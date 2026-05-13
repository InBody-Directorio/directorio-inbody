import { useState, useMemo, useCallback } from 'react';
import MapaDirectorio from '../components/MapaDirectorio.jsx';
import Sidebar from '../components/Sidebar.jsx';
import BottomSheet from '../components/BottomSheet.jsx';
import FiltrosBar from '../components/FiltrosBar.jsx';
import Header from '../components/Header.jsx';
import HeroBar from '../components/HeroBar.jsx';
import LocationButton from '../components/LocationButton.jsx';
import { useProfesionales } from '../hooks/useProfesionales.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

export default function HomePage() {
  const { profesionales, loading, error } = useProfesionales();
  const isMobile = useIsMobile();

  const [query, setQuery] = useState('');
  const [estado, setEstado] = useState(null);
  const [especialidad, setEspecialidad] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [flyToCoords, setFlyToCoords] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const filtered = useMemo(
    function () {
      return profesionales.filter(function (prof) {
        if (especialidad && prof.especialidad !== especialidad) return false;
        if (estado) {
          const matchEstado = (prof.ubicaciones || []).some(function (u) {
            return u.estado === estado;
          });
          if (!matchEstado) return false;
        }
        if (query) {
          const q = query.toLowerCase();
          if (!prof.nombre.toLowerCase().includes(q)) return false;
        }
        return true;
      });
    },
    [profesionales, query, estado, especialidad]
  );

  const stats = useMemo(
    function () {
      const estadosUnicos = new Set();
      const especialidadesUnicas = new Set();
      profesionales.forEach(function (p) {
        especialidadesUnicas.add(p.especialidad);
        (p.ubicaciones || []).forEach(function (u) {
          estadosUnicos.add(u.estado);
        });
      });
      return {
        totalProfesionales: profesionales.length,
        totalEstados: estadosUnicos.size,
        totalEspecialidades: especialidadesUnicas.size,
      };
    },
    [profesionales]
  );

  const handleSelect = useCallback(function (prof, ubic) {
    if (!prof) {
      setSelectedId(null);
      return;
    }
    setSelectedId(prof.id);
    if (ubic && ubic.lat && ubic.lng) {
      setFlyToCoords({ lat: ubic.lat, lng: ubic.lng });
    }
  }, []);

  const handleLocate = useCallback(function (coords) {
    setUserLocation(coords);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-inbody-red text-sm font-medium mb-2">
            Error al cargar el directorio
          </div>
          <div className="text-xs text-neutral-500 mb-4">{error}</div>
          <button
            onClick={function () {
              window.location.reload();
            }}
            className="text-xs text-inbody-red hover:underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-50">
      <Header />
      <HeroBar
        totalProfesionales={stats.totalProfesionales}
        totalEstados={stats.totalEstados}
        totalEspecialidades={stats.totalEspecialidades}
      />
      <FiltrosBar
        query={query}
        onQueryChange={setQuery}
        estado={estado}
        onEstadoChange={setEstado}
        especialidad={especialidad}
        onEspecialidadChange={setEspecialidad}
        resultsCount={filtered.length}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {!isMobile && (
          <Sidebar
            profesionales={filtered}
            loading={loading}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        )}

        <main className="flex-1 relative">
          <MapaDirectorio
            profesionales={filtered}
            selectedId={selectedId}
            onSelectProfesional={handleSelect}
            flyToCoords={flyToCoords}
            userLocation={userLocation}
          />
          <LocationButton onLocate={handleLocate} />
        </main>

        {isMobile && (
          <BottomSheet
            profesionales={filtered}
            loading={loading}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        )}
      </div>
    </div>
  );
}
