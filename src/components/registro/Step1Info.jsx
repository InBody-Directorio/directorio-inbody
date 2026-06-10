import { FormField, TextInput, Select, TextArea } from './FormFields.jsx';
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
          Información del profesional
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Datos públicos que aparecerán en tu perfil del directorio.
        </p>
      </div>

      <FormField label="Nombre completo o nombre del consultorio" required error={errors.nombre}>
        <TextInput
          value={formData.nombre}
          onChange={function (v) { updateField('nombre', v); }}
          placeholder="Dr. María Hernández / Nutrición Integral"
          maxLength={120}
          error={errors.nombre}
        />
      </FormField>

      <FormField label="Especialidad o tipo de práctica" required error={errors.especialidad}>
        <Select
          value={formData.especialidad}
          onChange={function (v) { updateField('especialidad', v); }}
          placeholder="Selecciona tu categoría"
          options={ESPECIALIDADES.map(function (e) {
            return { value: e.id, label: e.label };
          })}
          error={errors.especialidad}
        />
      </FormField>

      <FormField
        label="Descripción breve"
        hint="Una frase corta que aparece en tu tarjeta del directorio (máx 200 caracteres)"
      >
        <TextArea
          value={formData.descripcion_breve}
          onChange={function (v) { updateField('descripcion_breve', v); }}
          placeholder="Ej. Especialistas en composición corporal y planes nutricionales personalizados."
          maxLength={200}
          rows={2}
        />
      </FormField>

      <FormField
        label="Foto del consultorio o instalaciones"
        required
        hint="Sube una foto de tus instalaciones, NO tu rostro. Esta foto representa tu consultorio en el directorio público."
        error={errors.foto_perfil}
      >
        <PhotoUpload
          value={formData.foto_perfil}
          onChange={function (f) { updateField('foto_perfil', f); }}
          placeholder="Sube una foto de tu consultorio"
          aspect="cover"
        />
      </FormField>
    </div>
  );
}
