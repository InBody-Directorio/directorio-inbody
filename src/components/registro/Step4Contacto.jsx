import { FormField, TextInput, PhoneInput, Checkbox } from './FormFields.jsx';

export default function Step4Contacto({ formData, updateField, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-2">Paso 4</div>
        <h2 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight mb-1.5">
          Información de contacto
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Estos datos aparecen en tu perfil del directorio para que tus pacientes puedan contactarte.
        </p>
      </div>

      <FormField label="WhatsApp" required hint="Botón de contacto principal en tu perfil" error={errors.whatsapp}>
        <PhoneInput
          value={formData.whatsapp}
          onChange={function (v) { updateField('whatsapp', v); }}
          error={errors.whatsapp}
        />
      </FormField>

      <FormField label="Teléfono" required hint="Para llamadas tradicionales" error={errors.telefono}>
        <PhoneInput
          value={formData.telefono}
          onChange={function (v) { updateField('telefono', v); }}
          error={errors.telefono}
        />
      </FormField>

      <FormField label="Correo electrónico" required error={errors.email}>
        <TextInput
          type="email"
          value={formData.email}
          onChange={function (v) { updateField('email', v.trim().toLowerCase()); }}
          placeholder="tu@correo.com"
          error={errors.email}
        />
      </FormField>

      <div className="border-t border-neutral-150 pt-5">
        <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-400 font-semibold mb-3">Redes sociales (opcional)</div>

        <div className="space-y-3">
          <FormField label="Sitio web">
            <TextInput
              value={formData.sitio_web}
              onChange={function (v) { updateField('sitio_web', v.trim()); }}
              placeholder="https://misitio.com"
            />
          </FormField>

          <FormField label="Instagram">
            <TextInput
              value={formData.instagram}
              onChange={function (v) { updateField('instagram', v.trim()); }}
              placeholder="@miusuario"
            />
          </FormField>

          <FormField label="Facebook">
            <TextInput
              value={formData.facebook}
              onChange={function (v) { updateField('facebook', v.trim()); }}
              placeholder="Mi Página Facebook"
            />
          </FormField>
        </div>
      </div>

      {/* Honeypot anti-spam */}
      <input
        type="text"
        name="website"
        value={formData.honeypot || ''}
        onChange={function (e) { updateField('honeypot', e.target.value); }}
        tabIndex="-1"
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
        aria-hidden="true"
      />

      <div className="border-t border-neutral-150 pt-5">
        <Checkbox
          checked={formData.consentimiento_privacidad}
          onChange={function (v) { updateField('consentimiento_privacidad', v); }}
          error={errors.consentimiento_privacidad}
        >
          Acepto el aviso de privacidad y autorizo que InBody México use mi información para verificar mi registro y publicar mi perfil en el directorio oficial.
        </Checkbox>
        {errors.consentimiento_privacidad && (
          <div className="mt-1 text-[11px] text-inbody-red">{errors.consentimiento_privacidad}</div>
        )}
      </div>
    </div>
  );
}
