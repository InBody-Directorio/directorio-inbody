import { useState, useRef, useEffect } from 'react';
import { Plus, X, MapPin, Loader2, Search } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { FormField, TextInput, Select } from './FormFields.jsx';
import { ESTADOS_MX } from '../../config/estados.js';
import { MAPBOX_TOKEN, geocodeAddress, reverseGeocode } from '../../lib/mapbox.js';

mapboxgl.accessToken = MAPBOX_TOKEN;

const MAX_UBICACIONES = 3;

export default function Step3Ubicacion({ formData, updateField, errors }) {
  const ubicaciones = formData.ubicaciones || [];

  function updateUbic(idx, key, value) {
    const next = ubicaciones.map(function (u, i) {
      if (i !== idx) return u;
      return { ...u, [key]: value };
    });
    updateField('ubicaciones', next);
  }

  function setCoords(idx, lat, lng) {
    const next = ubicaciones.map(function (u, i) {
      if (i !== idx) return u;
      return { ...u, lat: lat, lng: lng, geo_status: 'geocoded' };
    });
    updateField('ubicaciones', next);
  }

  function applyReverseData(idx, geo) {
    if (!geo) return;
    const next = ubicaciones.map(function (u, i) {
      if (i !== idx) return u;
      return {
        ...u,
        direccion_completa: geo.direccion || u.direccion_completa,
        ciudad: geo.ciudad || u.ciudad,
        estado: geo.estado || u.estado,
        codigo_postal: geo.codigo_postal || u.codigo_postal,
      };
    });
    updateField('ubicaciones', next);
  }

  function addUbic() {
    if (ubicaciones.length >= MAX_UBICACIONES) return;
    updateField('ubicaciones', ubicaciones.concat([{
      direccion_completa: '', ciudad: '', estado: '', codigo_postal: '', lat: null, lng: null, geo_status: 'idle',
    }]));
  }

  function removeUbic(idx) {
    if (ubicaciones.length === 1) return;
    updateField('ubicaciones', ubicaciones.filter(function (_, i) { return i !== idx; }));
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-2">Paso 3</div>
        <h2 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight mb-1.5">
          Ubicación de tu consultorio
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Puedes registrar hasta {MAX_UBICACIONES} ubicaciones. La primera será tu ubicación principal.
        </p>
      </div>

      {ubicaciones.map(function (u, idx) {
        const err = (errors['ubicacion_' + idx]) || {};
        return (
          <UbicacionFields
            key={idx}
            idx={idx}
            ubicacion={u}
            onChange={function (k, v) { updateUbic(idx, k, v); }}
            onCoords={function (lat, lng) { setCoords(idx, lat, lng); }}
            onReverse={function (geo) { applyReverseData(idx, geo); }}
            onRemove={ubicaciones.length > 1 ? function () { removeUbic(idx); } : null}
            errors={err}
          />
        );
      })}

      {ubicaciones.length < MAX_UBICACIONES && (
        <button
          type="button"
          onClick={addUbic}
          className="w-full p-3 border-2 border-dashed border-neutral-200 hover:border-inbody-red/30 hover:bg-inbody-red-soft/30 rounded-xl text-xs text-neutral-700 hover:text-inbody-red transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar otra ubicación
        </button>
      )}
    </div>
  );
}

function UbicacionFields({ idx, ubicacion, onChange, onCoords, onReverse, onRemove, errors }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(function () {
    if (!mapContainer.current || map.current) return;

    const initialCenter = ubicacion.lat && ubicacion.lng
      ? [ubicacion.lng, ubicacion.lat]
      : [-99.1332, 19.4326]; // CDMX

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: initialCenter,
      zoom: ubicacion.lat ? 14 : 11,
      attributionControl: false,
    });

    marker.current = new mapboxgl.Marker({
      color: '#E31937',
      draggable: true,
    }).setLngLat(initialCenter).addTo(map.current);

    marker.current.on('dragend', async function () {
      const lngLat = marker.current.getLngLat();
      onCoords(lngLat.lat, lngLat.lng);
      const geo = await reverseGeocode(lngLat.lat, lngLat.lng);
      if (geo) onReverse(geo);
    });

    return function () {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(function () {
    if (ubicacion.lat && ubicacion.lng && marker.current && map.current) {
      marker.current.setLngLat([ubicacion.lng, ubicacion.lat]);
      map.current.flyTo({ center: [ubicacion.lng, ubicacion.lat], zoom: 14, duration: 800 });
    }
  }, [ubicacion.lat, ubicacion.lng]);

  async function handleSearch() {
    if (!searchQuery) return;
    setSearching(true);
    try {
      const result = await geocodeAddress(searchQuery);
      if (result) {
        onCoords(result.lat, result.lng);
        const geo = await reverseGeocode(result.lat, result.lng);
        if (geo) onReverse(geo);
      }
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-400 font-semibold">
          {idx === 0 ? 'Ubicación principal' : 'Ubicación ' + (idx + 1)}
        </div>
        {onRemove && (
          <button type="button" onClick={onRemove} className="text-xs text-inbody-red hover:underline flex items-center gap-1">
            <X className="w-3 h-3" />Quitar
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1.5">Buscar dirección</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={function (e) { setSearchQuery(e.target.value); }}
            onKeyDown={function (e) { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
            placeholder="Ej. Av. Reforma 222, Polanco, CDMX"
            className="flex-1 px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm transition-all outline-none"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-inbody-red text-white text-xs font-medium transition-colors disabled:opacity-60 flex items-center gap-1.5"
          >
            {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Buscar
          </button>
        </div>
        <div className="mt-1 text-[11px] text-neutral-500">O arrastra el pin rojo en el mapa para fijar tu ubicación exacta.</div>
      </div>

      <div ref={mapContainer} className="rounded-xl overflow-hidden border border-neutral-200" style={{ height: '240px' }} />

      <FormField label="Dirección completa" required error={errors.direccion_completa}>
        <TextInput
          value={ubicacion.direccion_completa}
          onChange={function (v) { onChange('direccion_completa', v); }}
          placeholder="Calle, número, colonia"
          error={errors.direccion_completa}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField label="Ciudad / Municipio" required error={errors.ciudad}>
          <TextInput
            value={ubicacion.ciudad}
            onChange={function (v) { onChange('ciudad', v); }}
            placeholder="Ej. Miguel Hidalgo"
            error={errors.ciudad}
          />
        </FormField>
        <FormField label="Estado" required error={errors.estado}>
          <Select
            value={ubicacion.estado}
            onChange={function (v) { onChange('estado', v); }}
            placeholder="Selecciona el estado"
            options={ESTADOS_MX.map(function (e) { return { value: e, label: e }; })}
            error={errors.estado}
          />
        </FormField>
      </div>

      <FormField label="Código postal" hint="Opcional pero recomendado">
        <TextInput
          value={ubicacion.codigo_postal}
          onChange={function (v) { onChange('codigo_postal', v.replace(/\D/g, '').slice(0, 5)); }}
          placeholder="Ej. 11550"
          maxLength={5}
        />
      </FormField>

      {ubicacion.lat && ubicacion.lng && (
        <div className="flex items-center gap-1.5 text-[11px] text-green-700">
          <MapPin className="w-3 h-3" />
          Coordenadas confirmadas: {ubicacion.lat.toFixed(5)}, {ubicacion.lng.toFixed(5)}
        </div>
      )}
    </div>
  );
}
