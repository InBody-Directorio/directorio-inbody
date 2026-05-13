import { FormField, TextInput, PhoneInput } from './FormFields.jsx';
import { ExternalLink } from 'lucide-react';

export default function Step4Contacto({ formData, updateField, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-2">
          Paso 4
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight mb-1.5">
          ¿Cómo te <em className="italic font-light text-inbody-red">contactan?</em>
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Estos son los medios por los que tus futuros pacientes podrán llegar a ti.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField label="WhatsApp" required error={errors.whatsapp}>
          <PhoneInput
            value={formData.whatsapp}
            onChange={function (v) {
              updateField('whatsapp', v);
            }}
            placeholder="55 1234 5678"
            error={errors.whatsapp}
          />
        </FormField>
        <FormField label="Teléfono" required error={errors.telefono}>
          <PhoneInput
            value={formData.telefono}
            onChange={function (v) {
              updateField('telefono', v);
            }}
            placeholder="55 1234 5678"
            error={errors.telefono}
          />
        </FormField>
      </div>

      <FormField
        label="Correo electrónico"
        required
        error={errors.email}
        hint="Aquí recibirás la confirmación y el aviso de aprobación de tu registro."
      >
        <TextInput
          type="email"
          value={formData.email}
          onChange={function (v) {
            updateField('email', v.toLowerCase().trim());
          }}
          placeholder="tu@correo.com"
          error={errors.email}
        />
      </FormField>

      <div className="border-t border-neutral-150 pt-5">
        <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-400 font-semibold mb-3">
          Redes sociales y sitio web · Opcionales
        </div>

        <div className="space-y-3">
          <FormField label="Sitio web">
            <TextInput
              value={formData.sitio_web}
              onChange={function (v) {
                updateField('sitio_web', v);
              }}
              placeholder="https://tusitio.com"
              error={errors.sitio_web}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField label="Instagram">
              <TextInput
                value={formData.instagram}
                onChange={function (v) {
                  updateField('instagram', v);
                }}
                placeholder="@tuusuario"
              />
            </FormField>
            <FormField label="Facebook">
              <TextInput
                value={formData.facebook}
                onChange={function (v) {
                  updateField('facebook', v);
                }}
                placeholder="facebook.com/tupagina"
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Honeypot field - invisible para humanos, los bots lo llenan */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <label>No llenar este campo</label>
        <input
          type="text"
          tabIndex="-1"
          autoComplete="off"
          value={formData.honeypot || ''}
          onChange={function (e) {
            updateField('honeypot', e.target.value);
          }}
        />
      </div>

      <div className="border-t border-neutral-150 pt-5">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={!!formData.consentimiento_privacidad}
            onChange={function (e) {
              updateField('consentimiento_privacidad', e.target.checked);
            }}
            className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-inbody-red focus:ring-inbody-red/30 cursor-pointer"
          />
          <span className="text-xs text-neutral-700 leading-relaxed">
            He leído y acepto el{' '}
            <a
              href="https://www.inbodymexico.com/aviso-de-privacidad/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-inbody-red hover:underline font-medium inline-flex items-center gap-0.5"
            >
              aviso de privacidad
              <ExternalLink className="w-2.5 h-2.5" />
            </a>{' '}
            de InBody México. Autorizo el uso de mi información profesional y mis fotos para aparecer públicamente en el directorio.
          </span>
        </label>
        {errors.consentimiento_privacidad && (
          <div className="mt-2 text-[11px] text-inbody-red flex items-center gap-1.5">
            <span>⚠</span>
            {errors.consentimiento_privacidad}
          </div>
        )}
      </div>
    </div>
  );
}
