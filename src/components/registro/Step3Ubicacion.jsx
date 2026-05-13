import { useEffect, useRef } from 'react';
import { FormField, TextInput, Select } from './FormFields.jsx';
import { Plus, X, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ESTADOS_MEXICO } from '../../config/estados.js';
import { geocodeAddress } from '../../lib/mapbox.js';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '../../lib/mapbox.js';

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function Step3Ubicacion({ formData, updateField, errors }) {
  const ubicaciones = formData.ubicaciones || [{ direccion_completa: '', ciudad: '', estado: '', codigo_postal: '', lat: null, lng: null, geo_status: 'idle' }];

  function updateUbicacion(idx, key, value) {
    const next = [...ubicaciones];
    next[idx] = { ...next[idx], [key]: value };
    updateField('ubicaciones', next);
  }

  function setGeoStatus(idx, status, coords) {
    const next = [...ubicaciones];
    next[idx] = {
      ...next[idx],
      geo_status: status,
      lat: coords ? coords.lat : null,
      lng: coords ? coords.lng : null,
      direccion_formateada: coords ? coords.formatted : null,
    };
    updateField('ubicaciones', next);
  }

  function addUbicacion() {
    if (ubicaciones.length >= 3) return;
    updateField('ubicaciones', [
      ...ubicaciones,
      { direccion_completa: '', ciudad: '', estado: '', codigo_postal: '', lat: null, lng: null, geo_status: 'idle' },
    ]);
  }

  function removeUbicacion(idx) {
    if (ubicaciones.length === 1) return;
    const next = ubicaciones.filter(function (_, i) {
      return i !== idx;
    });
    updateField('ubicaciones', next);
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-2">
          Paso 3
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight mb-1.5">
          ¿Dónde estás <em className="italic font-light text-inbody-red">ubicado?</em>
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Tu dirección aparecerá como pin en el mapa del directorio. Si tienes más de una sucursal, puedes agregar hasta 3.
        </p>
      </div>

      {ubicaciones.map(function (ubic, idx) {
        return (
          <UbicacionBlock
            key={idx}
            index={idx}
            ubicacion={ubic}
            isFirst={idx === 0}
            canRemove={ubicaciones.length > 1}
            onChange={function (key, value) {
              updateUbicacion(idx, key, value);
            }}
            onGeocode={function (status, coords) {
              setGeoStatus(idx, status, coords);
            }}
            onRemove={function () {
              removeUbicacion(idx);
            }}
            errors={errors['ubicacion_' + idx] || {}}
          />
        );
      })}

      {ubicaciones.length < 3 && (
        <button
          type="button"
          onClick={addUbicacion}
          className="w-full py-3 border-2 border-dashed border-neutral-300 hover:border-inbody-red/40 hover:bg-inbody-red-soft/30 rounded-2xl text-sm font-medium text-neutral-600 hover:text-inbody-red transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar otra ubicación ({ubicaciones.length}/3)
        </button>
      )}
    </div>
  );
}

function UbicacionBlock({ index, ubicacion, isFirst, canRemove, onChange, onGeocode, onRemove, errors }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const geocodeTimeout = useRef(null);

  // Geocodificar con debounce cuando cambian direccion + ciudad + estado
  useEffect(
    function () {
      if (!ubicacion.direccion_completa || !ubicacion.ciudad || !ubicacion.estado) {
        return;
      }

      if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);

      onGeocode('loading', null);
      geocodeTimeout.current = setTimeout(async function () {
        const fullAddress =
          ubicacion.direccion_completa +
          ', ' +
          ubicacion.ciudad +
          ', ' +
          ubicacion.estado +
          (ubicacion.codigo_postal ? ', ' + ubicacion.codigo_postal : '') +
          ', México';
        try {
          const result = await geocodeAddress(fullAddress);
          if (result) {
            onGeocode('success', result);
          } else {
            onGeocode('not_found', null);
          }
        } catch (err) {
          onGeocode('error', null);
        }
      }, 1200);

      return function () {
        if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
      };
    },
    [ubicacion.direccion_completa, ubicacion.ciudad, ubicacion.estado, ubicacion.codigo_postal]
  );

  // Mini mapa cuando hay coordenadas
  useEffect(
    function () {
      if (!ubicacion.lat || !ubicacion.lng) {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
        return;
      }
      if (!mapContainer.current) return;

      if (!map.current) {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [ubicacion.lng, ubicacion.lat],
          zoom: 14,
          interactive: false,
          attributionControl: false,
        });

        map.current.on('load', function () {
          const el = document.createElement('div');
          el.className = 'inbody-marker';
          marker.current = new mapboxgl.Marker({ element: el })
            .setLngLat([ubicacion.lng, ubicacion.lat])
            .addTo(map.current);
        });
      } else {
        map.current.setCenter([ubicacion.lng, ubicacion.lat]);
        if (marker.current) {
          marker.current.setLngLat([ubicacion.lng, ubicacion.lat]);
        }
      }

      return function () {};
    },
    [ubicacion.lat, ubicacion.lng]
  );

  const geoStatus = ubicacion.geo_status || 'idle';

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-inbody-red-soft text-inbody-red flex items-center justify-center text-xs font-semibold">
            {index + 1}
          </div>
          <div className="text-sm font-medium text-neutral-900">
            {isFirst ? 'Ubicación principal' : 'Ubicación ' + (index + 1)}
          </div>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-neutral-500 hover:text-inbody-red transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Quitar
          </button>
        )}
      </div>

      <FormField label="Dirección (calle y número)" required error={errors.direccion_completa}>
        <TextInput
          value={ubicacion.direccion_completa}
          onChange={function (v) {
            onChange('direccion_completa', v);
          }}
          placeholder="Av. Insurgentes Sur 1234, Del Valle"
          error={errors.direccion_completa}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Ciudad" required error={errors.ciudad}>
          <TextInput
            value={ubicacion.ciudad}
            onChange={function (v) {
              onChange('ciudad', v);
            }}
            placeholder="Ciudad de México"
            error={errors.ciudad}
          />
        </FormField>
        <FormField label="Estado" required error={errors.estado}>
          <Select
            value={ubicacion.estado}
            onChange={function (v) {
              onChange('estado', v);
            }}
            placeholder="Selecciona"
            options={ESTADOS_MEXICO.map(function (e) {
              return { value: e, label: e };
            })}
            error={errors.estado}
          />
        </FormField>
      </div>

      <FormField label="Código postal" hint="Opcional, ayuda a precisar la ubicación en el mapa">
        <TextInput
          value={ubicacion.codigo_postal}
          onChange={function (v) {
            onChange('codigo_postal', v.replace(/\D/g, '').slice(0, 5));
          }}
          placeholder="03100"
          maxLength={5}
        />
      </FormField>

      {/* Estado de geocodificación */}
      {(geoStatus !== 'idle' || ubicacion.lat) && (
        <div className="rounded-xl overflow-hidden border border-neutral-200">
          <div className="px-3 py-2 bg-neutral-50 flex items-center gap-2">
            {geoStatus === 'loading' && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin" />
                <span className="text-xs text-neutral-500">Buscando dirección en el mapa...</span>
              </>
            )}
            {geoStatus === 'success' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs text-neutral-700">
                  Ubicación encontrada en el mapa
                </span>
              </>
            )}
            {(geoStatus === 'not_found' || geoStatus === 'error') && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs text-neutral-700 leading-relaxed">
                  No pudimos ubicar tu dirección automáticamente. El equipo de InBody la revisará y la corregirá al aprobar tu registro.
                </span>
              </>
            )}
          </div>
          {geoStatus === 'success' && ubicacion.lat && (
            <div ref={mapContainer} style={{ height: '160px', width: '100%' }} />
          )}
        </div>
      )}
    </div>
  );
}
