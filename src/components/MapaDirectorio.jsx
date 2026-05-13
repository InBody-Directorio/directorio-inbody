import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN, MEXICO_CENTER } from '../lib/mapbox.js';
import { getEspecialidadLabel } from '../config/especialidades.js';
import { getModeloLabel } from '../config/modelos.js';

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function MapaDirectorio({
  profesionales,
  selectedId,
  onSelectProfesional,
  flyToCoords,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const activePopup = useRef(null);

  // Inicializar el mapa
  useEffect(function () {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [MEXICO_CENTER.lng, MEXICO_CENTER.lat],
      zoom: MEXICO_CENTER.zoom,
      attributionControl: false,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'top-right'
    );

    map.current.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      'bottom-right'
    );
  }, []);

  // Agregar marcadores cuando cambien los profesionales
  useEffect(
    function () {
      if (!map.current) return;

      // Esperar a que el mapa esté listo
      function setupMarkers() {
        // Limpiar marcadores anteriores
        Object.values(markers.current).forEach(function (m) {
          m.remove();
        });
        markers.current = {};

        // Agregar nuevos marcadores
        profesionales.forEach(function (prof) {
          (prof.ubicaciones || []).forEach(function (ubic) {
            if (!ubic.lat || !ubic.lng) return;

            const el = document.createElement('div');
            el.className = 'inbody-marker';
            el.setAttribute('data-prof-id', prof.id);

            el.addEventListener('click', function (e) {
              e.stopPropagation();
              onSelectProfesional && onSelectProfesional(prof, ubic);
            });

            const marker = new mapboxgl.Marker({ element: el })
              .setLngLat([ubic.lng, ubic.lat])
              .addTo(map.current);

            markers.current[prof.id + '_' + ubic.id] = marker;
          });
        });
      }

      if (map.current.loaded()) {
        setupMarkers();
      } else {
        map.current.on('load', setupMarkers);
      }
    },
    [profesionales, onSelectProfesional]
  );

  // Highlight visual del marcador seleccionado
  useEffect(
    function () {
      Object.entries(markers.current).forEach(function (entry) {
        const key = entry[0];
        const marker = entry[1];
        const el = marker.getElement();
        const profId = key.split('_')[0];
        if (profId === selectedId) {
          el.classList.add('selected');
        } else {
          el.classList.remove('selected');
        }
      });
    },
    [selectedId]
  );

  // Volar a coordenadas cuando se selecciona desde el sidebar
  useEffect(
    function () {
      if (!map.current || !flyToCoords) return;
      map.current.flyTo({
        center: [flyToCoords.lng, flyToCoords.lat],
        zoom: 13,
        duration: 1200,
        essential: true,
      });
    },
    [flyToCoords]
  );

  // Mostrar popup al seleccionar un profesional
  useEffect(
    function () {
      if (!map.current || !selectedId) {
        if (activePopup.current) {
          activePopup.current.remove();
          activePopup.current = null;
        }
        return;
      }

      const prof = profesionales.find(function (p) {
        return p.id === selectedId;
      });
      if (!prof || !prof.ubicaciones || prof.ubicaciones.length === 0) return;

      const ubic = prof.ubicaciones[0];
      if (!ubic.lat || !ubic.lng) return;

      // Limpiar popup anterior
      if (activePopup.current) {
        activePopup.current.remove();
      }

      const popupHTML = renderPopupHTML(prof, ubic);

      activePopup.current = new mapboxgl.Popup({
        offset: 24,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '320px',
        className: 'inbody-popup',
      })
        .setLngLat([ubic.lng, ubic.lat])
        .setHTML(popupHTML)
        .addTo(map.current);

      activePopup.current.on('close', function () {
        onSelectProfesional && onSelectProfesional(null, null);
      });
    },
    [selectedId, profesionales, onSelectProfesional]
  );

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
}

function renderPopupHTML(prof, ubic) {
  const especialidad = getEspecialidadLabel(prof.especialidad);
  const modelo = getModeloLabel(prof.modelo_inbody);
  const fotoSrc = prof.foto_perfil_url || ubic.foto_lugar_url || '';
  const waMessage = encodeURIComponent(
    'Hola, te contacto desde el directorio oficial de InBody México. Me interesa agendar una consulta contigo.'
  );
  const waLink =
    'https://wa.me/' + (prof.whatsapp || '').replace(/\D/g, '') + '?text=' + waMessage;
  const mapsLink =
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(ubic.direccion_completa + ', ' + ubic.ciudad);

  const fotoHTML = fotoSrc
    ? '<img src="' + fotoSrc + '" style="width:100%;height:120px;object-fit:cover;" />'
    : '<div style="width:100%;height:120px;background:linear-gradient(135deg,#f4f3ee,#e8e8e3);display:flex;align-items:center;justify-content:center;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b4b2a9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';

  return (
    '<div style="font-family:Inter,-apple-system,sans-serif;">' +
    '<div style="position:relative;">' +
    fotoHTML +
    '<div style="position:absolute;top:8px;right:8px;background:white;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:500;color:#18181a;box-shadow:0 1px 4px rgba(0,0,0,0.08);">' +
    modelo +
    '</div>' +
    '</div>' +
    '<div style="padding:14px 16px 16px;">' +
    '<div style="font-size:15px;font-weight:600;color:#18181a;letter-spacing:-0.01em;margin-bottom:2px;">' +
    escapeHTML(prof.nombre) +
    '</div>' +
    '<div style="font-size:12px;color:#5c5c60;margin-bottom:10px;">' +
    especialidad +
    '</div>' +
    (prof.descripcion_breve
      ? '<div style="font-size:12px;color:#5c5c60;line-height:1.5;margin-bottom:12px;">' +
        escapeHTML(prof.descripcion_breve) +
        '</div>'
      : '') +
    '<div style="display:flex;align-items:start;gap:6px;font-size:12px;color:#5c5c60;margin-bottom:12px;line-height:1.4;">' +
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E31937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>' +
    '<span>' +
    escapeHTML(ubic.direccion_completa) +
    ', ' +
    escapeHTML(ubic.ciudad) +
    '</span>' +
    '</div>' +
    '<a href="' +
    waLink +
    '" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:#E31937;color:white;font-size:13px;font-weight:500;padding:11px;border-radius:10px;text-decoration:none;margin-bottom:6px;transition:background 0.15s ease;">' +
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>' +
    'Contactar por WhatsApp' +
    '</a>' +
    '<div style="display:flex;gap:6px;">' +
    (prof.telefono
      ? '<a href="tel:' +
        prof.telefono +
        '" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:white;color:#18181a;font-size:12px;padding:9px;border-radius:8px;text-decoration:none;border:0.5px solid rgba(0,0,0,0.15);">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
        'Llamar' +
        '</a>'
      : '') +
    '<a href="' +
    mapsLink +
    '" target="_blank" rel="noopener" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:white;color:#18181a;font-size:12px;padding:9px;border-radius:8px;text-decoration:none;border:0.5px solid rgba(0,0,0,0.15);">' +
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>' +
    'Cómo llegar' +
    '</a>' +
    '</div>' +
    '</div>' +
    '</div>'
  );
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
