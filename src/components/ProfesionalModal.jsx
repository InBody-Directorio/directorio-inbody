import { useEffect, useRef } from 'react';
import { X, MapPin, MessageCircle, Phone, Mail, Globe, Instagram, Facebook, Sparkles } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '../lib/mapbox.js';
import { getEspecialidadLabel } from '../config/especialidades.js';
import { getModeloLabel } from '../config/modelos.js';
import ImagenModelo from './ImagenModelo.jsx';

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function ProfesionalModal({ profesional, onClose }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(function () {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return function () {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(function () {
    if (!profesional || !profesional.ubicaciones) return;
    const ubicConCoords = profesional.ubicaciones.filter(function (u) { return u.lat && u.lng; });
    if (ubicConCoords.length === 0) return;
    if (!mapContainer.current) return;

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [ubicConCoords[0].lng, ubicConCoords[0].lat],
      zoom: 12,
      attributionControl: false,
    });

    map.current.on('load', function () {
      ubicConCoords.forEach(function (u) {
        const el = document.createElement('div');
        el.className = 'inbody-marker';
        new mapboxgl.Marker({ element: el }).setLngLat([u.lng, u.lat]).addTo(map.current);
      });

      if (ubicConCoords.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        ubicConCoords.forEach(function (u) { bounds.extend([u.lng, u.lat]); });
        map.current.fitBounds(bounds, { padding: 50, duration: 0 });
      }
    });

    return function () {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [profesional]);

  if (!profesional) return null;

  const especialidad = getEspecialidadLabel(profesional.especialidad);
  const modeloLabel = getModeloLabel(profesional.modelo_inbody);
  const cleanWA = (profesional.whatsapp || '').replace(/\D/g, '');
  const whatsappLink = cleanWA ? 'https://wa.me/52' + cleanWA : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />
      <div
        onClick={function (e) { e.stopPropagation(); }}
        className="relative bg-white w-full md:max-w-2xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-fade-in"
      >
        {profesional.foto_perfil_url && (
          <div className="relative h-44 md:h-52 w-full overflow-hidden bg-neutral-100">
            <img src={profesional.foto_perfil_url} alt={profesional.nombre} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center backdrop-blur-md transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-7">
            {!profesional.foto_perfil_url && (
              <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="mb-5">
              <div className="text-[10px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-1.5">{especialidad}</div>
              <h2 className="font-display text-2xl md:text-3xl font-medium text-neutral-900 leading-tight mb-2">{profesional.nombre}</h2>
              {profesional.descripcion_breve && (
                <p className="text-sm text-neutral-600 leading-relaxed">{profesional.descripcion_breve}</p>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 bg-inbody-red-soft/50 border border-inbody-red/15 rounded-xl mb-5">
              <ImagenModelo modeloId={profesional.modelo_inbody} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-inbody-red font-semibold mb-0.5">Equipo InBody</div>
                <div className="text-sm font-semibold text-inbody-red-dark">{modeloLabel}</div>
              </div>
              <Sparkles className="w-4 h-4 text-inbody-red/60" />
            </div>

            <div className="mb-5">
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-3">Ubicaciones ({(profesional.ubicaciones || []).length})</div>
              <div className="space-y-2 mb-4">
                {(profesional.ubicaciones || []).map(function (u, idx) {
                  return (
                    <div key={idx} className="flex items-start gap-2.5 p-3 bg-neutral-50 rounded-xl">
                      <MapPin className="w-3.5 h-3.5 text-inbody-red flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 text-xs">
                        {idx === 0 && <div className="text-[9px] uppercase tracking-wider text-inbody-red font-semibold mb-0.5">Principal</div>}
                        <div className="text-neutral-900 leading-relaxed">{u.direccion_completa}</div>
                        <div className="text-neutral-500 mt-0.5">{u.ciudad}, {u.estado}{u.codigo_postal ? ' · CP ' + u.codigo_postal : ''}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div ref={mapContainer} className="rounded-xl overflow-hidden border border-neutral-200" style={{ height: '180px' }} />
            </div>

            <div className="mb-5">
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-3">Contacto</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {whatsappLink && (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center"><MessageCircle className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-green-700 font-semibold">WhatsApp</div>
                      <div className="text-xs text-green-900 font-medium truncate">{formatPhone(profesional.whatsapp)}</div>
                    </div>
                  </a>
                )}
                {profesional.telefono && (
                  <a href={'tel:+52' + (profesional.telefono || '').replace(/\D/g, '')} className="flex items-center gap-2 p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center"><Phone className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Teléfono</div>
                      <div className="text-xs text-neutral-900 truncate">{formatPhone(profesional.telefono)}</div>
                    </div>
                  </a>
                )}
                {profesional.email && (
                  <a href={'mailto:' + profesional.email} className="flex items-center gap-2 p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center"><Mail className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Email</div>
                      <div className="text-xs text-neutral-900 truncate">{profesional.email}</div>
                    </div>
                  </a>
                )}
                {profesional.sitio_web && (
                  <a href={profesional.sitio_web} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center"><Globe className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Web</div>
                      <div className="text-xs text-neutral-900 truncate">{profesional.sitio_web}</div>
                    </div>
                  </a>
                )}
                {profesional.instagram && (
                  <a href={'https://instagram.com/' + (profesional.instagram || '').replace('@', '')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center"><Instagram className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Instagram</div>
                      <div className="text-xs text-neutral-900 truncate">{profesional.instagram}</div>
                    </div>
                  </a>
                )}
                {profesional.facebook && (
                  <a href={profesional.facebook.indexOf('http') === 0 ? profesional.facebook : 'https://facebook.com/' + profesional.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center"><Facebook className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Facebook</div>
                      <div className="text-xs text-neutral-900 truncate">{profesional.facebook}</div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPhone(p) {
  if (!p) return '';
  const c = p.replace(/\D/g, '');
  if (c.length === 10) return '+52 ' + c.slice(0,2) + ' ' + c.slice(2,6) + ' ' + c.slice(6);
  return p;
}
