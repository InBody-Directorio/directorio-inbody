import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import HeroBar from '../components/HeroBar.jsx';
import FiltrosBar from '../components/FiltrosBar.jsx';
import MapaDirectorio from '../components/MapaDirectorio.jsx';
import ProfesionalCard from '../components/ProfesionalCard.jsx';
import ProfesionalModal from '../components/ProfesionalModal.jsx';
import OnboardingHint from '../components/OnboardingHint.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import MarcaAutoridad from '../components/MarcaAutoridad.jsx';
import CtaProfesionales from '../components/CtaProfesionales.jsx';

export default function HomePage() {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ especialidad: '', estado: '', modelo: '' });
  const [selected, setSelected] = useState(null);

  useEffect(function () {
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profesionales')
          .select('*, ubicaciones(*)')
          .eq('status', 'aprobado')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProfesionales(data || []);
      } catch (err) {
        console.error('Error cargando profesionales:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(function () {
    return profesionales.filter(function (p) {
      if (filters.especialidad && p.especialidad !== filters.especialidad) return false;
      if (filters.modelo && p.modelo_inbody !== filters.modelo) return false;
      if (filters.estado) {
        const hasEstado = (p.ubicaciones || []).some(function (u) { return u.estado === filters.estado; });
        if (!hasEstado) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const inNombre = (p.nombre || '').toLowerCase().indexOf(q) !== -1;
        const inEspecialidad = (p.especialidad || '').toLowerCase().indexOf(q) !== -1;
        const inDesc = (p.descripcion_breve || '').toLowerCase().indexOf(q) !== -1;
        const inCiudad = (p.ubicaciones || []).some(function (u) {
          return (u.ciudad || '').toLowerCase().indexOf(q) !== -1 || (u.estado || '').toLowerCase().indexOf(q) !== -1;
        });
        if (!inNombre && !inEspecialidad && !inDesc && !inCiudad) return false;
      }
      return true;
    });
  }, [profesionales, search, filters]);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <HeroBar value={search} onChange={setSearch} />
        <MarcaAutoridad />
        <FiltrosBar filters={filters} onChange={setFilters} totalResults={filtered.length} />

        {loading ? (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 text-center">
            <Loader2 className="w-6 h-6 text-inbody-red animate-spin mx-auto mb-3" />
            <div className="text-sm text-neutral-500">Cargando profesionales...</div>
          </div>
        ) : (
          <>
            {filtered.length > 0 ? (
              <>
                <MapaDirectorio profesionales={filtered} onSelectProfesional={setSelected} />
                <OnboardingHint />
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {filtered.map(function (p) {
                      return (
                        <ProfesionalCard
                          key={p.id}
                          profesional={p}
                          onClick={function () { setSelected(p); }}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
                <div className="text-5xl mb-3 opacity-30">🔍</div>
                <h3 className="font-display text-xl font-medium text-neutral-900 mb-2">Sin resultados</h3>
                <p className="text-sm text-neutral-500">Intenta ajustar tus filtros o búsqueda.</p>
              </div>
            )}
          </>
        )}

        <HowItWorks />
        <CtaProfesionales />
      </main>

      <Footer />

      {selected && (
        <ProfesionalModal
          profesional={selected}
          onClose={function () { setSelected(null); }}
        />
      )}
    </div>
  );
}
