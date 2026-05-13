import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPinOff } from 'lucide-react';
import { MAPBOX_TOKEN, MEXICO_CENTER } from '../lib/mapbox.js';
import { getEspecialidadLabel } from '../config/especialidades.js';
import { getModeloLabel } from '../config/modelos.js';

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function MapaDirectorio({
  profesionales,
  selectedId,
  onSelectProfesional,
  flyToCoords,
  userLocation,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const activePopup = useRef(null);
  const activeTooltip = useRef(null);
  const userMarker = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(function () {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [MEXICO_CENTER.lng, MEXICO_CENTER.lat],
      zoom: MEXICO_CENTER.zoom,
      attributionControl: false,
      pitch: 0,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false, visualizePitch: false }),
      'top-right'
    );

    map.current.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    map.current.on('load', function () {
      // Custom styling: tinte rojo sutil en carreteras
      try {
        const layers = map.current.getStyle().layers;
        layers.forEach(function (layer) {
          if (layer.id.includes('road-primary') || layer.id.includes('road-secondary')) {
            try {
              map.current.setPaintProperty(layer.id, 'line-color', '#f0e0e3');
            } catch (e) {}
          }
          if (layer.id.includes('road-trunk') || layer.id.includes('road-motorway')) {
            try {
              map.current.setPaintProperty(layer.id, 'line-color', '#fad8dc');
            } catch (e) {}
          }
        });
      } catch (e) {
        console.warn('No se pudo aplicar custom styling:', e);
      }

      setMapReady(true);
    });
  }, []);

  useEffect(
    function () {
      if (!map.current || !mapReady) return;

      Object.values(markers.current).forEach(function (m) {
        m.remove();
      });
      markers.current = {};

      profesionales.forEach(function (prof) {
        (prof.ubicaciones || []).forEach(function (ubic) {
          if (!ubic.lat || !ubic.lng) return;

          const el = document.createElement('div');
          el.className = 'inbody-marker';
          el.setAttribute('data-prof-id', prof.id);
          el.setAttribute('data-prof-name', prof.nombre);

          el.addEventListener('click', function (e) {
            e.stopPropagation();
            onSelectProfesional && onSelectProfesional(prof, ubic);
          });

          // Tooltip hover
          el.addEventListener('mouseenter', function () {
            if (activeTooltip.current) {
              activeTooltip.current.remove();
            }
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'inbody-tooltip';
            tooltipEl.textContent = prof.nombre;

            activeTooltip.current = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 18,
              className: 'inbody-tooltip-popup',
              anchor: 'bottom',
            })
              .setLngLat([ubic.lng, ubic.lat])
              .setDOMContent(tooltipEl)
              .addTo(map.current);
          });

          el.addEventListener('mouseleave', function () {
            if (activeTooltip.current) {
              activeTooltip.current.remove();
              activeTooltip.current = null;
            }
          });

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([ubic.lng, ubic.lat])
            .addTo(map.current);

          markers.current[prof.id + '_' + ubic.id] = marker;
        });
      });
    },
    [profesionales, mapReady, onSelectProfesional]
  );

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

  useEffect(
    function () {
      if (!map.current || !flyToCoords) return;
      map.current.flyTo({
        center: [flyToCoords.lng, flyToCoords.lat],
        zoom: 13,
        duration: 1400,
        essential: true,
      });
    },
    [flyToCoords]
  );

  useEffect(
    function () {
      if (!map.current) return;

      if (userMarker.current) {
        userMarker.current.remove();
        userMarker.current = null;
      }

      if (userLocation && userLocation.lat && userLocation.lng) {
        const el = document.createElement('div');
        el.className = 'user-location-marker';

        userMarker.current = new mapboxgl.Marker({ element: el })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map.current);

        map.current.flyTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 11,
          duration: 1400,
        });
      }
    },
    [userLocation]
  );

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

      if (activePopup.current) {
        activePopup.current.remove();
      }
      // Quitar tooltip si está activo
      if (activeTooltip.current) {
        activeTooltip.current.remove();
        activeTooltip.current = null;
      }

      const popupHTML = renderPopupHTML(prof, ubic);

      activePopup.current = new mapboxgl.Popup({
        offset: 26,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '340px',
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

  const isEmpty = mapReady && profesionales.length === 0;

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '400px' }} />
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl px-6 py-5 max-w-xs text-center shadow-xl pointer-events-auto">
            <div className="w-10 h-10 rounded-full bg-inbody-red-soft mx-auto mb-3 flex items-center justify-center">
              <MapPinOff className="w-4 h-4 text-inbody-red" />
            </div>
            <div className="text-sm font-medium text-neutral-900 mb-1">
              Sin profesionales
            </div>
            <div className="text-xs text-neutral-500 leading-relaxed">
              No encontramos profesionales con esta combinación de filtros. Prueba con otros.
            </div>
          </div>
        </div>
      )}
    </div>
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
    ? '<img src="' + fotoSrc + '" style="width:100%;height:140px;object-fit:cover;" />'
    : '<div style="width:100%;height:140px;background:linear-gradient(135deg,#f4f3ee,#e8e8e3);display:flex;align-items:center;justify-content:center;"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#b4b2a9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';

  return (
    '<div style="font-family:Inter,-apple-system,sans-serif;">' +
    '<div style="position:relative;">' +
    fotoHTML +
    '<div style="position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);padding:4px 11px;border-radius:99px;font-size:11px;font-weight:600;color:#18181a;box-shadow:0 2px 6px rgba(0,0,0,0.12);">' +
    modelo +
    '</div>' +
    '<div style="position:absolute;bottom:10px;left:10px;display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);padding:4px 10px;border-radius:99px;">' +
    '<div style="width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,0.6);"></div>' +
    '<span style="font-size:10px;font-weight:500;color:white;letter-spacing:0.04em;">Disponible</span>' +
    '</div>' +
    '</div>' +
    '<div style="padding:16px 18px 18px;">' +
    '<div style="font-size:16px;font-weight:600;color:#18181a;letter-spacing:-0.01em;margin-bottom:3px;line-height:1.25;">' +
    escapeHTML(prof.nombre) +
    '</div>' +
    '<div style="font-size:12px;color:#5c5c60;margin-bottom:12px;">' +
    especialidad +
    '</div>' +
    (prof.descripcion_breve
      ? '<div style="font-size:12px;color:#5c5c60;line-height:1.55;margin-bottom:14px;">' +
        escapeHTML(prof.descripcion_breve) +
        '</div>'
      : '') +
    '<div style="display:flex;align-items:start;gap:7px;font-size:12px;color:#5c5c60;margin-bottom:14px;line-height:1.4;padding:10px 12px;background:#fafaf7;border-radius:10px;">' +
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E31937" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>' +
    '<span>' +
    escapeHTML(ubic.direccion_completa) +
    ', ' +
    escapeHTML(ubic.ciudad) +
    '</span>' +
    '</div>' +
    '<a href="' +
    waLink +
    '" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:9px;width:100%;background:#E31937;color:white;font-size:13px;font-weight:600;padding:12px;border-radius:11px;text-decoration:none;margin-bottom:7px;transition:all 0.15s ease;box-shadow:0 4px 14px rgba(227,25,55,0.28);">' +
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>' +
    'Agendar por WhatsApp' +
    '</a>' +
    '<div style="display:flex;gap:6px;">' +
    (prof.telefono
      ? '<a href="tel:' +
        prof.telefono +
        '" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:white;color:#18181a;font-size:12px;font-weight:500;padding:9px;border-radius:9px;text-decoration:none;border:0.5px solid rgba(0,0,0,0.12);transition:background 0.15s;">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
        'Llamar' +
        '</a>'
      : '') +
    '<a href="' +
    mapsLink +
    '" target="_blank" rel="noopener" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:white;color:#18181a;font-size:12px;font-weight:500;padding:9px;border-radius:9px;text-decoration:none;border:0.5px solid rgba(0,0,0,0.12);transition:background 0.15s;">' +
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
