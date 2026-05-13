import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, MapPin, Database, Wrench } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import { MAPBOX_TOKEN } from '../lib/mapbox.js';

export default function HomePage() {
  const [supabaseStatus, setSupabaseStatus] = useState('checking');
  const [mapboxStatus, setMapboxStatus] = useState('checking');
  const [profesionalesCount, setProfesionalesCount] = useState(null);

  useEffect(() => {
    checkSupabase();
    checkMapbox();
  }, []);

  async function checkSupabase() {
    try {
      const { count, error } = await supabase
        .from('profesionales')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setProfesionalesCount(count);
      setSupabaseStatus('ok');
    } catch (err) {
      console.error('Supabase error:', err);
      setSupabaseStatus('error');
    }
  }

  async function checkMapbox() {
    if (!MAPBOX_TOKEN) {
      setMapboxStatus('error');
      return;
    }
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/CDMX.json?country=mx&limit=1&access_token=${MAPBOX_TOKEN}`
      );
      if (!res.ok) throw new Error('Mapbox no responde');
      setMapboxStatus('ok');
    } catch (err) {
      console.error('Mapbox error:', err);
      setMapboxStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-2 h-8 bg-inbody-red rounded-sm" />
            <span className="text-sm font-medium tracking-wide">Directorio InBody México</span>
          </div>
          <h1 className="font-display text-5xl font-light tracking-tight mb-4 leading-tight">
            Setup técnico <em className="text-inbody-red">en línea</em>
          </h1>
          <p className="text-neutral-600 text-base leading-relaxed">
            Verificando que todos los servicios estén conectados antes de empezar el desarrollo del directorio público.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <StatusRow
            icon={<Database className="w-5 h-5" />}
            label="Supabase (base de datos)"
            status={supabaseStatus}
            detail={
              supabaseStatus === 'ok'
                ? `Conectado · ${profesionalesCount} profesionales en BD`
                : supabaseStatus === 'error'
                ? 'No se pudo conectar. Revisa el SQL del schema.'
                : 'Verificando...'
            }
          />
          <StatusRow
            icon={<MapPin className="w-5 h-5" />}
            label="Mapbox (API del mapa)"
            status={mapboxStatus}
            detail={
              mapboxStatus === 'ok'
                ? 'Token válido, geocodificación operativa'
                : mapboxStatus === 'error'
                ? 'Token inválido o falta VITE_MAPBOX_TOKEN'
                : 'Verificando...'
            }
            isLast
          />
        </div>

        {supabaseStatus === 'ok' && mapboxStatus === 'ok' && (
          <div className="mt-8 p-5 bg-green-50 border border-green-200 rounded-xl text-center">
            <p className="text-sm text-green-800 font-medium mb-1">
              ¡Todo listo! Conexiones activas.
            </p>
            <p className="text-xs text-green-700">
              Avísale a Rodrigo para arrancar con el Bloque 2 (directorio público).
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-neutral-400">
          <Link to="/registro" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
            <Wrench className="w-3 h-3" /> /registro
          </Link>
          <span>·</span>
          <Link to="/admin" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
            <Wrench className="w-3 h-3" /> /admin
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ icon, label, status, detail, isLast }) {
  return (
    <div className={`flex items-center gap-4 p-5 ${!isLast ? 'border-b border-neutral-150' : ''}`}>
      <div className="text-neutral-400 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-neutral-900">{label}</div>
        <div className="text-xs text-neutral-500 mt-0.5">{detail}</div>
      </div>
      <div className="flex-shrink-0">
        {status === 'checking' && <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />}
        {status === 'ok' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
        {status === 'error' && <XCircle className="w-5 h-5 text-inbody-red" />}
      </div>
    </div>
  );
}
