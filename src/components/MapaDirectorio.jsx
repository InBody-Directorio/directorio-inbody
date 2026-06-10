import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPinOff } from 'lucide-react';
import { MAPBOX_TOKEN, MEXICO_CENTER } from '../lib/mapbox.js';
import { getEspecialidadLabel } from '../config/especialidades.js';
import { getModeloLabel } from '../config/modelos.js';

mapboxgl.accessToken = MAPBOX_TOKEN;

const MEXICO_BOUNDS = [
  [-118.5, 14.0],
  [-86.0, 33.0],
];

const SOURCE_ID = 'profesionales-src';
const CLUSTER_LAYER = 'clusters';
const CLUSTER_COUNT_LAYER = 'cluster-count';

export default function MapaDirectorio({
  profesionales,
  selectedId,
  onSelectProfesional,
  onOpenDetails,
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

  // Init del mapa
  useEffect(function () {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [MEXICO_CENTER.lng, MEXICO_CENTER.lat],
      zoom: MEXICO_CENTER.zoom,
      minZoom: 4.2,
      maxBounds: MEXICO_BOUNDS,
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
      // Custom styling cálido
      try {
        const layers = map.current.getStyle().layers;
        function setPaintSafe(layerId, prop, value) {
          try {
            map.current.setPaintProperty(layerId, prop, value);
          } catch (e) {}
        }

        layers.forEach(function (layer) {
          if (layer.id === 'land' || layer.id === 'landcover' || layer.id === 'land-structure-polygon') {
            setPaintSafe(layer.id, 'background-color', '#f7f1ec');
            setPaintSafe(layer.id, 'fill-color', '#f7f1ec');
          }
          if (layer.id.includes('water')) {
            setPaintSafe(layer.id, 'fill-color', '#d6e4ec');
          }
          if (layer.id.includes('motorway') || layer.id.includes('trunk')) {
            setPaintSafe(layer.id, 'line-color', '#f0b8be');
          }
          if (layer.id.includes('road-primary') || layer.id.includes('road-secondary')) {
            setPaintSafe(layer.id, 'line-color', '#f5d4d8');
          }
          if (layer.id.includes('park') || layer.id.includes('landuse')) {
            setPaintSafe(layer.id, 'fill-color', '#e8eee0');
          }
        });
      } catch (e) {
        console.warn('No se pudo aplicar custom styling:', e);
      }

      // Inicializar source vacío para clusters
      map.current.addSource(SOURCE_ID, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 45,
      });

      // Capa de clusters (burbujas rojas)
      map.current.addLayer({
        id: CLUSTER_LAYER,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#E31937',
          'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 15, 30],
          'circle-stroke-width': 3,
          'circle-stroke-color': 'rgba(255,255,255,0.95)',
          'circle-opacity': 0.92,
        },
      });

      // Texto con el conteo dentro del cluster
      map.current.addLayer({
        id: CLUSTER_COUNT_LAYER,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 13,
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Clic en cluster: hace zoom in
      map.current.on('click', CLUSTER_LAYER, function (e) {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: [CLUSTER_LAYER],
        });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource(SOURCE_ID).getClusterExpansionZoom(clusterId, function (err, zoom) {
          if (err) return;
          map.current.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
            duration: 800,
          });
        });
      });

      // Cursor pointer en clusters
      map.current.on('mouseenter', CLUSTER_LAYER, function () {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', CLUSTER_LAYER, function () {
        map.current.getCanvas().style.cursor = '';
      });

      setMapReady(true);
    });
  }, []);

  // Actualizar source con los profesionales filtrados Y crear markers individuales
  useEffect(
    function () {
      if (!map.current || !mapReady) return;
      const source = map.current.getSource(SOURCE_ID);
      if (!source) return;

      // Construir features GeoJSON
      const features = [];
      profesionales.forEach(function (prof) {
        (prof.ubicaciones || []).forEach(function (ubic) {
          if (!ubic.lat || !ubic.lng) return;
          features.push({
            type: 'Feature',
            properties: {
              profId: prof.id,
              ubicId: ubic.id,
              nombre: prof.nombre,
            },
            geometry: {
              type: 'Point',
              coordinates: [ubic.lng, ubic.lat],
            },
          });
        });
      });

      source.setData({ type: 'FeatureCollection', features: features });

      // Limpiar markers DOM anteriores
      Object.values(markers.current).forEach(function (m) {
        m.remove();
      });
      markers.current = {};

      // Función para actualizar markers individuales basado en clusters actuales
      function updateMarkers() {
        const newKeys = new Set();
        const renderedFeatures = map.current.querySourceFeatures(SOURCE_ID);

        renderedFeatures.forEach(function (feature) {
          if (feature.properties.cluster) return; // Skip clusters
          const profId = feature.properties.profId;
          const ubicId = feature.properties.ubicId;
          const key = profId + '_' + ubicId;
          newKeys.add(key);

          if (markers.current[key]) return; // Ya existe

          const prof = profesionales.find(function (p) {
            return p.id === profId;
          });
          if (!prof) return;
          const ubic = (prof.ubicaciones || []).find(function (u) {
            return u.id === ubicId;
          });
          if (!ubic) return;

          const el = document.createElement('div');
          el.className = 'inbody-marker';
          el.setAttribute('data-prof-id', profId);

          el.addEventListener('click', function (e) {
            e.stopPropagation();
            onSelectProfesional && onSelectProfesional(prof, ubic);
          });

          el.addEventListener('mouseenter', function () {
            if (activeTooltip.current) activeTooltip.current.remove();
            const tooltipEl = document.createElement('div');
            tooltipEl.textContent = prof.nombre;
            activeTooltip.current = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 18,
              className: 'inbody-tooltip-popup',
              anchor: 'bottom',
            })
              .setLngLat(feature.geometry.coordinates)
              .setDOMContent(tooltipEl)
              .addTo(map.current);
          });
          el.addEventListener('mouseleave', function () {
            if (activeTooltip.current) {
              activeTooltip.current.remove();
              activeTooltip.current = null;
            }
          });

          if (selectedId === profId) {
            el.classList.add('selected');
          }

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat(feature.geometry.coordinates)
            .addTo(map.current);
          markers.current[key] = marker;
        });

        // Quitar markers que ya no aplican
        Object.keys(markers.current).forEach(function (key) {
          if (!newKeys.has(key)) {
            markers.current[key].remove();
            delete markers.current[key];
          }
        });
      }

      // Eventos para actualizar markers cuando cambia zoom/pan
      map.current.on('moveend', updateMarkers);
      map.current.on('zoomend', updateMarkers);
      map.current.on('sourcedata', function (e) {
        if (e.sourceId === SOURCE_ID && e.isSourceLoaded) {
          updateMarkers();
        }
      });

      // Render inicial después de un tick
      setTimeout(updateMarkers, 100);

      return function () {
        if (map.current) {
          map.current.off('moveend', updateMarkers);
          map.current.off('zoomend', updateMarkers);
        }
      };
    },
    [profesionales, mapReady, onSelectProfesional, selectedId]
  );

  // Highlight visual del marker seleccionado
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
    [selectedId, profesionales]
  );

  // Volar a coordenadas seleccionadas
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

  // Ubicación del usuario
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

  // Popup compacto al seleccionar
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

      if (activePopup.current) activePopup.current.remove();
      if (activeTooltip.current) {
        activeTooltip.current.remove();
        activeTooltip.current = null;
      }

      const popupNode = renderPopupNode(prof, ubic, function () {
        onOpenDetails && onOpenDetails(prof, ubic);
      });

      activePopup.current = new mapboxgl.Popup({
        offset: 22,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '260px',
        className: 'inbody-popup',
        anchor: 'bottom',
      })
        .setLngLat([ubic.lng, ubic.lat])
        .setDOMContent(popupNode)
        .addTo(map.current);

      activePopup.current.on('close', function () {
        onSelectProfesional && onSelectProfesional(null, null);
      });
    },
    [selectedId, profesionales, onSelectProfesional, onOpenDetails]
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
            <div className="text-sm font-medium text-neutral-900 mb-1">Sin profesionales</div>
            <div className="text-xs text-neutral-500 leading-relaxed">
              No encontramos profesionales con esta combinación de filtros. Prueba con otros.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Popup compacto con botón "Compartir" agregado.
 */
function renderPopupNode(prof, ubic, onOpenDetails) {
  const especialidad = getEspecialidadLabel(prof.especialidad);
  const modelo = getModeloLabel(prof.modelo_inbody);
  const fotoSrc = prof.foto_perfil_url || ubic.foto_lugar_url || '';
  const waMessage = encodeURIComponent(
    'Hola, te contacto desde el directorio oficial de InBody México. Me interesa agendar una consulta contigo.'
  );
  const waLink =
    'https://wa.me/' + (prof.whatsapp || '').replace(/\D/g, '') + '?text=' + waMessage;

  const container = document.createElement('div');
  container.style.fontFamily = 'Inter, -apple-system, sans-serif';

  container.innerHTML =
    '<div style="padding:12px 14px;">' +
    '<div style="display:flex;gap:10px;margin-bottom:10px;">' +
    (fotoSrc
      ? '<img src="' + fotoSrc + '" style="width:46px;height:46px;border-radius:12px;object-fit:cover;flex-shrink:0;" />'
      : '<div style="width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#f4f3ee,#e8e8e3);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b4b2a9" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/></svg></div>') +
    '<div style="flex:1;min-width:0;">' +
    '<div style="font-size:13px;font-weight:600;color:#18181a;line-height:1.25;margin-bottom:2px;">' +
    escapeHTML(prof.nombre) +
    '</div>' +
    '<div style="font-size:11px;color:#5c5c60;margin-bottom:4px;">' +
    especialidad +
    '</div>' +
    '<div style="display:inline-flex;align-items:center;gap:3px;padding:1px 7px;background:#f4f3ee;border-radius:4px;font-size:9px;font-weight:600;color:#5c5c60;">' +
    escapeHTML(modelo) +
    '</div>' +
    '</div>' +
    '</div>' +
    '<a href="' + waLink + '" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:#E31937;color:white;font-size:12px;font-weight:600;padding:9px;border-radius:9px;text-decoration:none;margin-bottom:6px;box-shadow:0 2px 8px rgba(227,25,55,0.25);">' +
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>' +
    'WhatsApp' +
    '</a>' +
    '<button class="popup-details-btn" style="display:flex;align-items:center;justify-content:center;gap:5px;width:100%;background:white;color:#18181a;font-size:11px;font-weight:500;padding:7px;border-radius:8px;border:0.5px solid rgba(0,0,0,0.12);cursor:pointer;font-family:inherit;">' +
    'Ver más detalles' +
    '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' +
    '</button>' +
    '</div>';

  const detailsBtn = container.querySelector('.popup-details-btn');
  if (detailsBtn) {
    detailsBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      onOpenDetails();
    });
  }

  return container;
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
