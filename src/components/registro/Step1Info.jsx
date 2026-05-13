import { FormField, TextInput, TextArea, Select } from './FormFields.jsx';
import PhotoUpload from './PhotoUpload.jsx';
import { ESPECIALIDADES } from '../../config/especialidades.js';

export default function Step1Info({ formData, updateField, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-2">
          Paso 1
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight mb-1.5">
          Información <em className="italic font-light text-inbody-red">profesional</em>
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Datos básicos que aparecerán en tu perfil del directorio.
        </p>
      </div>

      <FormField
        label="Nombre completo o nombre del negocio"
        required
        error={errors.nombre}
      >
        <TextInput
          value={formData.nombre}
          onChange={function (v) {
            updateField('nombre', v);
          }}
          placeholder="Dra. María Hernández / Centro Wellness Polanco"
          maxLength={100}
          error={errors.nombre}
        />
      </FormField>

      <FormField
        label="Especialidad"
        required
        error={errors.especialidad}
      >
        <Select
          value={formData.especialidad}
          onChange={function (v) {
            updateField('especialidad', v);
          }}
          placeholder="Selecciona tu especialidad"
          options={ESPECIALIDADES.map(function (e) {
            return { value: e.id, label: e.label };
          })}
          error={errors.especialidad}
        />
      </FormField>

      <FormField
        label="Descripción profesional breve"
        hint="Esta descripción aparecerá en tu tarjeta del directorio. Sé breve y específico."
        error={errors.descripcion_breve}
      >
        <TextArea
          value={formData.descripcion_breve}
          onChange={function (v) {
            updateField('descripcion_breve', v);
          }}
          placeholder="Ej. Nutrióloga con 10 años de experiencia en composición corporal y planes deportivos."
          maxLength={200}
          rows={3}
        />
      </FormField>

      <FormField
        label="Foto de perfil"
        required
        error={errors.foto_perfil}
        hint="Esta foto se mostrará públicamente en tu tarjeta del directorio."
      >
        <PhotoUpload
          value={formData.foto_perfil}
          onChange={function (v) {
            updateField('foto_perfil', v);
          }}
        />
      </FormField>
    </div>
  );
}
