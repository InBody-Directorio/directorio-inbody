import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN, MEXICO_CENTER } from '../lib/mapbox.js';

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function MapaDirectorio({ profesionales, onSelectProfesional }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  useEffect(function () {
    if (!mapContainer.current) return;
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [MEXICO_CENTER.lng, MEXICO_CENTER.lat],
      zoom: MEXICO_CENTER.zoom,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

    return function () {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(function () {
    if (!map.current) return;

    markers.current.forEach(function (m) { m.remove(); });
    markers.current = [];

    const puntos = [];
    profesionales.forEach(function (p) {
      (p.ubicaciones || []).forEach(function (u) {
        if (u.lat && u.lng && u.activa !== false) {
          puntos.push({ prof: p, ubic: u });
        }
      });
    });

    puntos.forEach(function (pt) {
      const el = document.createElement('div');
      el.className = 'inbody-marker';
      el.title = pt.prof.nombre + ' - ' + (pt.ubic.ciudad || '');

      el.addEventListener('click', function (e) {
        e.stopPropagation();
        onSelectProfesional(pt.prof);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([pt.ubic.lng, pt.ubic.lat])
        .addTo(map.current);

      markers.current.push(marker);
    });

    if (puntos.length === 1) {
      map.current.flyTo({
        center: [puntos[0].ubic.lng, puntos[0].ubic.lat],
        zoom: 13,
        duration: 1000,
      });
    } else if (puntos.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      puntos.forEach(function (pt) { bounds.extend([pt.ubic.lng, pt.ubic.lat]); });
      map.current.fitBounds(bounds, { padding: 80, duration: 1000, maxZoom: 13 });
    }
  }, [profesionales, onSelectProfesional]);

  return (
    <div className="bg-neutral-50 border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div ref={mapContainer} className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm" style={{ height: '420px' }} />
      </div>
    </div>
  );
}
