import { FormField, Select } from './FormFields.jsx';
import PhotoUpload from './PhotoUpload.jsx';
import { Info, Shield } from 'lucide-react';
import { MODELOS_INBODY } from '../../config/modelos.js';

export default function Step2Equipo({ formData, updateField, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-2">
          Paso 2
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight mb-1.5">
          Tu equipo <em className="italic font-light text-inbody-red">InBody</em>
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Información sobre el equipo InBody que tienes en tu consultorio o gimnasio.
        </p>
      </div>

      <FormField
        label="Modelo de tu equipo InBody"
        required
        error={errors.modelo_inbody}
      >
        <Select
          value={formData.modelo_inbody}
          onChange={function (v) {
            updateField('modelo_inbody', v);
          }}
          placeholder="Selecciona el modelo"
          options={MODELOS_INBODY.map(function (m) {
            return { value: m.id, label: m.label };
          })}
          error={errors.modelo_inbody}
        />
      </FormField>

      <div className="p-4 bg-inbody-red-soft/40 border border-inbody-red/15 rounded-2xl flex items-start gap-3">
        <Shield className="w-4 h-4 text-inbody-red flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-medium text-inbody-red-dark mb-1">
            Verificación de autenticidad
          </div>
          <div className="text-[11px] text-neutral-600 leading-relaxed">
            La foto de tu equipo nos permite confirmar que es un InBody original. El equipo de InBody México la validará antes de aprobar tu solicitud. Esta foto NO aparece pública en el directorio.
          </div>
        </div>
      </div>

      <FormField
        label="Foto de tu equipo InBody"
        required
        error={errors.foto_equipo}
      >
        <PhotoUpload
          value={formData.foto_equipo}
          onChange={function (v) {
            updateField('foto_equipo', v);
          }}
          exampleImage="Toma una foto al equipo donde se vea claramente el logo InBody y el modelo (por ejemplo: 770, 970S, BWA 2.0)."
        />
      </FormField>
    </div>
  );
}
