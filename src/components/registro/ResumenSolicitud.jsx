import { Check, Edit3, MapPin, Sparkles, Phone, Mail, Globe } from 'lucide-react';
import { getEspecialidadLabel } from '../../config/especialidades.js';
import { getModeloLabel } from '../../config/modelos.js';

export default function ResumenSolicitud({ formData, onEditStep, fotoPreviews }) {
  const especialidad = getEspecialidadLabel(formData.especialidad);
  const modelo = getModeloLabel(formData.modelo_inbody);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-2">
          Revisión final
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight mb-1.5">
          Revisa tu <em className="italic font-light text-inbody-red">información</em>
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Verifica que todo esté correcto antes de enviar. Puedes editar cualquier paso.
        </p>
      </div>

      <ResumenSection
        title="Información profesional"
        onEdit={function () {
          onEditStep(0);
        }}
      >
        <div className="flex items-start gap-4">
          {fotoPreviews.perfil && (
            <img
              src={fotoPreviews.perfil}
              alt="Perfil"
              className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-neutral-200"
            />
          )}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-base font-medium text-neutral-900 leading-tight">{formData.nombre}</div>
            <div className="text-xs text-neutral-500">{especialidad}</div>
            {formData.descripcion_breve && (
              <div className="text-xs text-neutral-600 leading-relaxed mt-2">
                {formData.descripcion_breve}
              </div>
            )}
          </div>
        </div>
      </ResumenSection>

      <ResumenSection
        title="Equipo InBody"
        onEdit={function () {
          onEditStep(1);
        }}
      >
        <div className="flex items-start gap-4">
          {fotoPreviews.equipo && (
            <img
              src={fotoPreviews.equipo}
              alt="Equipo"
              className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-neutral-200"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-inbody-red-soft border border-inbody-red/15 text-xs font-medium text-inbody-red-dark">
              <Sparkles className="w-3 h-3" />
              {modelo}
            </div>
          </div>
        </div>
      </ResumenSection>

      <ResumenSection
        title={'Ubicaciones (' + (formData.ubicaciones || []).length + ')'}
        onEdit={function () {
          onEditStep(2);
        }}
      >
        <div className="space-y-3">
          {(formData.ubicaciones || []).map(function (u, idx) {
            return (
              <div key={idx} className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-inbody-red flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">
                    {idx === 0 ? 'Principal' : 'Ubicación ' + (idx + 1)}
                  </div>
                  <div className="text-xs text-neutral-900 leading-relaxed">
                    {u.direccion_completa}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {u.ciudad}, {u.estado}
                    {u.codigo_postal && ' · CP ' + u.codigo_postal}
                  </div>
                  {u.geo_status === 'success' && (
                    <div className="text-[10px] text-green-600 flex items-center gap-1 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                      Ubicada en el mapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ResumenSection>

      <ResumenSection
        title="Contacto"
        onEdit={function () {
          onEditStep(3);
        }}
      >
        <div className="space-y-2">
          <ResumenRow icon={<Phone className="w-3 h-3" />} label="WhatsApp" value={formatPhone(formData.whatsapp)} />
          <ResumenRow icon={<Phone className="w-3 h-3" />} label="Teléfono" value={formatPhone(formData.telefono)} />
          <ResumenRow icon={<Mail className="w-3 h-3" />} label="Correo" value={formData.email} />
          {formData.sitio_web && (
            <ResumenRow icon={<Globe className="w-3 h-3" />} label="Web" value={formData.sitio_web} />
          )}
          {formData.instagram && (
            <ResumenRow icon={<span className="text-[10px]">IG</span>} label="Instagram" value={formData.instagram} />
          )}
          {formData.facebook && (
            <ResumenRow icon={<span className="text-[10px]">FB</span>} label="Facebook" value={formData.facebook} />
          )}
        </div>
      </ResumenSection>
    </div>
  );
}

function ResumenSection({ title, onEdit, children }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 font-semibold">
          {title}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-[11px] text-inbody-red hover:underline font-medium flex items-center gap-1"
        >
          <Edit3 className="w-3 h-3" />
          Editar
        </button>
      </div>
      {children}
    </div>
  );
}

function ResumenRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <div className="w-5 h-5 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-500 flex-shrink-0">
        {icon}
      </div>
      <div className="text-neutral-400 w-16 flex-shrink-0">{label}:</div>
      <div className="text-neutral-900 truncate">{value}</div>
    </div>
  );
}

function formatPhone(phone) {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return '+52 ' + clean.slice(0, 2) + ' ' + clean.slice(2, 6) + ' ' + clean.slice(6);
  }
  return phone;
}
