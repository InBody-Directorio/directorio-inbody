import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export function useProfesionalesAdmin(status) {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async function () {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('profesionales')
        .select('*, ubicaciones(*)')
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);

      const { data, error: dbErr } = await query;
      if (dbErr) throw dbErr;

      setProfesionales(data || []);
    } catch (err) {
      console.error('Error cargando profesionales:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(function () {
    fetchData();
  }, [fetchData]);

  return { profesionales, loading, error, refetch: fetchData };
}

export function useCountPendientes() {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async function () {
    try {
      const { count: c } = await supabase
        .from('profesionales')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendiente');
      setCount(c || 0);
    } catch (err) {
      console.error('Error count pendientes:', err);
    }
  }, []);

  useEffect(function () {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return function () { clearInterval(interval); };
  }, [fetchCount]);

  return { count, refetch: fetchCount };
}
