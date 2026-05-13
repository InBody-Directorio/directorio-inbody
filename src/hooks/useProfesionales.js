import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * Obtiene todos los profesionales aprobados con sus ubicaciones.
 * Cada profesional viene con un array de ubicaciones (puede tener varias).
 */
export function useProfesionales() {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);

        const { data: profs, error: profsError } = await supabase
          .from('profesionales')
          .select('*')
          .eq('status', 'aprobado')
          .order('created_at', { ascending: false });

        if (profsError) throw profsError;

        const { data: ubics, error: ubicsError } = await supabase
          .from('ubicaciones')
          .select('*')
          .eq('activa', true);

        if (ubicsError) throw ubicsError;

        const combined = profs.map(function (p) {
          const profUbics = ubics.filter(function (u) {
            return u.profesional_id === p.id;
          });
          return Object.assign({}, p, { ubicaciones: profUbics });
        });

        setProfesionales(combined);
      } catch (err) {
        console.error('Error cargando profesionales:', err);
        setError(err.message || 'Error al cargar profesionales');
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, []);

  return { profesionales, loading, error };
}
