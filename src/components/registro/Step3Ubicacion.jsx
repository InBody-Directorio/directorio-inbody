import { useEffect, useRef, useState } from 'react';
import { FormField, TextInput, Select } from './FormFields.jsx';
import { Plus, X, CheckCircle2, AlertCircle, Loader2, Move } from 'lucide-react';
import { ESTADOS_MEXICO } from '../../config/estados.js';
import { geocodeAddress, reverseGeocode, MAPBOX_TOKEN } from '../../lib/mapbox.js';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function Step3Ubicacion({ formData, updateField, errors }) {
  const ubicaciones = formData.ubicaciones || [
    { direccion_completa: '', ciudad: '', estado: '', codigo_postal: '', lat: null, lng: null, geo_status: 'idle' },
  ];

  function updateUbicacion(idx, patch) {
    const next = ubicaciones.slice();
    next[idx] = { ...next[idx], ...patch };
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
          Llena tu dirección y luego ajusta el pin en el mapa para precisión exacta. Si tienes más de una sucursal, puedes agregar hasta 3.
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
            onUpdate={function (patch) {
              updateUbicacion(idx, patch);
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

function UbicacionBlock({ index, ubicacion, isFirst, canRemove, onUpdate, onRemove, errors }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const geocodeTimeout = useRef(null);

  // Flag: cuando el usuario está moviendo el pin, NO disparar geocode directo
  // (para que no se pelee con el reverse geocode)
  const isUserDragging = useRef(false);

  // Geocodificar con debounce cuando cambian campos de texto
  useEffect(
    function () {
      if (isUserDragging.current) return;

      if (
        !ubicacion.direccion_completa ||
        !ubicacion.ciudad ||
        !ubicacion.estado
      ) {
        return;
      }

      if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);

      onUpdate({ geo_status: 'loading' });

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
            onUpdate({
              geo_status: 'success',
              lat: result.lat,
              lng: result.lng,
              direccion_formateada: result.formatted,
            });
          } else {
            onUpdate({ geo_status: 'not_found' });
          }
        } catch (err) {
          onUpdate({ geo_status: 'error' });
        }
      }, 1200);

      return function () {
        if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
      };
    },
    [
      ubicacion.direccion_completa,
      ubicacion.ciudad,
      ubicacion.estado,
      ubicacion.codigo_postal,
    ]
  );

  // Inicializar/actualizar mini mapa cuando hay coordenadas
  useEffect(
    function () {
      if (!ubicacion.lat || !ubicacion.lng) {
        if (map.current) {
          map.current.remove();
          map.current = null;
          marker.current = null;
        }
        return;
      }
      if (!mapContainer.current) return;

      // Primera vez: crear el mapa
      if (!map.current) {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [ubicacion.lng, ubicacion.lat],
          zoom: 15,
          attributionControl: false,
        });

        map.current.on('load', function () {
          const el = document.createElement('div');
          el.className = 'inbody-marker selected';

          marker.current = new mapboxgl.Marker({
            element: el,
            draggable: true,
          })
            .setLngLat([ubicacion.lng, ubicacion.lat])
            .addTo(map.current);

          // Al iniciar el drag, marcamos el flag
          marker.current.on('dragstart', function () {
            isUserDragging.current = true;
          });

          // Cuando suelta el pin, hacer reverse geocode y actualizar campos
          marker.current.on('dragend', async function () {
            const lngLat = marker.current.getLngLat();
            const newLat = lngLat.lat;
            const newLng = lngLat.lng;

            onUpdate({
              lat: newLat,
              lng: newLng,
              geo_status: 'reversing',
            });

            try {
              const reverse = await reverseGeocode(newLat, newLng);
              if (reverse) {
                const updates = {
                  geo_status: 'success',
                  direccion_formateada: reverse.formatted,
                };
                if (reverse.direccion) updates.direccion_completa = reverse.direccion;
                if (reverse.ciudad) updates.ciudad = reverse.ciudad;
                if (reverse.estado) updates.estado = reverse.estado;
                if (reverse.codigo_postal) updates.codigo_postal = reverse.codigo_postal;
                onUpdate(updates);
              } else {
                onUpdate({ geo_status: 'success' });
              }
            } catch (err) {
              onUpdate({ geo_status: 'success' });
            } finally {
              // Liberar el flag para que el geocoding directo vuelva a funcionar
              setTimeout(function () {
                isUserDragging.current = false;
              }, 800);
            }
          });
        });
      } else {
        // Actualizaciones subsecuentes: solo si NO viene de drag del usuario
        if (!isUserDragging.current && marker.current) {
          map.current.flyTo({
            center: [ubicacion.lng, ubicacion.lat],
            zoom: 15,
            duration: 600,
          });
          marker.current.setLngLat([ubicacion.lng, ubicacion.lat]);
        }
      }
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

      <FormField
        label="Dirección (calle y número)"
        required
        error={errors.direccion_completa}
      >
        <TextInput
          value={ubicacion.direccion_completa}
          onChange={function (v) {
            onUpdate({ direccion_completa: v });
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
              onUpdate({ ciudad: v });
            }}
            placeholder="Ciudad de México"
            error={errors.ciudad}
          />
        </FormField>
        <FormField label="Estado" required error={errors.estado}>
          <Select
            value={ubicacion.estado}
            onChange={function (v) {
              onUpdate({ estado: v });
            }}
            placeholder="Selecciona"
            options={ESTADOS_MEXICO.map(function (e) {
              return { value: e, label: e };
            })}
            error={errors.estado}
          />
        </FormField>
      </div>

      <FormField
        label="Código postal"
        hint="Ayuda a precisar la ubicación en el mapa"
      >
        <TextInput
          value={ubicacion.codigo_postal}
          onChange={function (v) {
            onUpdate({ codigo_postal: v.replace(/\D/g, '').slice(0, 5) });
          }}
          placeholder="03100"
          maxLength={5}
        />
      </FormField>

      {/* Estado de geocodificación + mapa con pin arrastrable */}
      {(geoStatus !== 'idle' || ubicacion.lat) && (
        <div className="rounded-xl overflow-hidden border border-neutral-200">
          <div className="px-3.5 py-2.5 bg-neutral-50 flex items-center gap-2">
            {geoStatus === 'loading' && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin" />
                <span className="text-xs text-neutral-500">Buscando ubicación en el mapa...</span>
              </>
            )}
            {geoStatus === 'reversing' && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-inbody-red animate-spin" />
                <span className="text-xs text-neutral-700">Actualizando dirección...</span>
              </>
            )}
            {geoStatus === 'success' && (
              <>
                <Move className="w-3.5 h-3.5 text-inbody-red" />
                <span className="text-xs text-neutral-700">
                  <strong className="text-neutral-900">Arrastra el pin</strong> para ajustar la ubicación exacta
                </span>
              </>
            )}
            {(geoStatus === 'not_found' || geoStatus === 'error') && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs text-neutral-700 leading-relaxed">
                  No pudimos ubicar tu dirección automáticamente. El equipo de InBody la revisará al aprobar tu registro.
                </span>
              </>
            )}
          </div>
          {ubicacion.lat && ubicacion.lng && (
            <div
              ref={mapContainer}
              style={{ height: '220px', width: '100%' }}
            />
          )}
        </div>
      )}
    </div>
  );
}
