import { FormField, TextInput, Select } from './FormFields.jsx';
import PhotoUpload from './PhotoUpload.jsx';
import { getModelosParaSelector, getModelo, isModeloDescontinuado, isModeloNuevaGeneracion } from '../../config/modelos.js';
import ImagenModelo from '../ImagenModelo.jsx';
import { Info } from 'lucide-react';

export default function Step2Equipo({ formData, updateField, errors }) {
  const modeloSeleccionado = formData.modelo_inbody ? getModelo(formData.modelo_inbody) : null;
  const isDescontinuado = formData.modelo_inbody ? isModeloDescontinuado(formData.modelo_inbody) : false;
  const isNuevaGen = formData.modelo_inbody ? isModeloNuevaGeneracion(formData.modelo_inbody) : false;
  const showPreview = modeloSeleccionado && formData.modelo_inbody !== 'otro';

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-2">
          Paso 2
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight mb-1.5">
          Tu equipo InBody
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Información sobre el equipo que utilizas. El equipo de InBody verificará estos datos antes de aprobar tu registro.
        </p>
      </div>

      <FormField label="Modelo del equipo" required error={errors.modelo_inbody}>
        <Select
          value={formData.modelo_inbody}
          onChange={function (v) { updateField('modelo_inbody', v); }}
          placeholder="Selecciona tu modelo"
          options={getModelosParaSelector().map(function (m) {
            return { value: m.id, label: m.label };
          })}
          error={errors.modelo_inbody}
        />
      </FormField>

      {showPreview && (
        <div className="flex items-center gap-4 p-3 bg-inbody-red-soft/40 border border-inbody-red/15 rounded-2xl">
          <ImagenModelo modeloId={formData.modelo_inbody} size="md" className="!bg-white" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-inbody-red font-semibold mb-0.5">
              Equipo seleccionado
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-sm font-semibold text-neutral-900">{modeloSeleccionado.label}</div>
              {isDescontinuado && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[9px] font-semibold text-amber-800 uppercase tracking-wider">
                  Modelo descontinuado
                </span>
              )}
              {isNuevaGen && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-inbody-red-soft border border-inbody-red/20 text-[9px] font-semibold text-inbody-red uppercase tracking-wider">
                  Nueva generación
                </span>
              )}
            </div>
            {modeloSeleccionado.descripcion && (
              <div className="text-xs text-neutral-600 leading-relaxed mt-0.5">{modeloSeleccionado.descripcion}</div>
            )}
          </div>
        </div>
      )}

      <FormField
        label="Número de serie del equipo"
        required
        hint="Lo puedes encontrar en la parte trasera de tu equipo InBody. Solo el equipo de InBody verá este dato."
        error={errors.numero_serie}
      >
        <TextInput
          value={formData.numero_serie}
          onChange={function (v) { updateField('numero_serie', v.toUpperCase().trim()); }}
          placeholder="Ej. IB770-12345678"
          maxLength={50}
          error={errors.numero_serie}
        />
      </FormField>

      <FormField
        label="Foto del equipo InBody"
        required
        hint="Una foto de tu equipo InBody. Se usará solo para verificación interna por el equipo de InBody."
        error={errors.foto_equipo}
      >
        <PhotoUpload
          value={formData.foto_equipo}
          onChange={function (f) { updateField('foto_equipo', f); }}
          placeholder="Sube una foto de tu equipo"
          aspect="cover"
        />
      </FormField>

      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-600 leading-relaxed">
          <strong className="text-neutral-900">Verificación obligatoria.</strong> InBody México validará tu número de serie con su base de datos de equipos registrados. Si el número no coincide, la solicitud será rechazada.
        </div>
      </div>
    </div>
  );
}
