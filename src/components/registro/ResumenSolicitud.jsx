import { Edit2 } from 'lucide-react';
import { ESPECIALIDADES } from '../../config/especialidades.js';
import { MODELOS_INBODY, getModelo } from '../../config/modelos.js';

export default function ResumenSolicitud({ formData, onEditStep, fotoPreviews }) {
  const especialidad = ESPECIALIDADES.find(function (e) { return e.id === formData.especialidad; });
  const modelo = getModelo(formData.modelo_inbody);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-2">
          Paso final
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900 leading-tight mb-1.5">
          Revisa tu solicitud
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Verifica que toda la información sea correcta antes de enviar.
        </p>
      </div>

      <Section title="Información del profesional" onEdit={function () { onEditStep(0); }}>
        <div className="flex items-start gap-4">
          {fotoPreviews.perfil && (
            <img
              src={fotoPreviews.perfil}
              alt="Foto del consultorio"
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-neutral-200"
            />
          )}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-sm font-medium text-neutral-900">{formData.nombre}</div>
            <div className="text-xs text-neutral-500">{especialidad ? especialidad.label : formData.especialidad}</div>
            {formData.descripcion_breve && (
              <div className="text-xs text-neutral-600 leading-relaxed mt-1">{formData.descripcion_breve}</div>
            )}
          </div>
        </div>
      </Section>

      <Section title="Equipo InBody" onEdit={function () { onEditStep(1); }}>
        <div className="flex items-start gap-4">
          {fotoPreviews.equipo && (
            <img
              src={fotoPreviews.equipo}
              alt="Foto del equipo"
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-neutral-200"
            />
          )}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="text-sm font-medium text-neutral-900">{modelo ? modelo.label : formData.modelo_inbody}</div>
            <div className="text-[11px] text-neutral-500">
              <span className="text-neutral-400">Número de serie:</span> <span className="font-mono text-neutral-700">{formData.numero_serie}</span>
            </div>
          </div>
        </div>
      </Section>

      <Section title={'Ubicaciones (' + (formData.ubicaciones || []).length + ')'} onEdit={function () { onEditStep(2); }}>
        <div className="space-y-2">
          {(formData.ubicaciones || []).map(function (u, idx) {
            return (
              <div key={idx} className="text-xs text-neutral-700 leading-relaxed">
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">
                  {idx === 0 ? 'Principal' : 'Ubicación ' + (idx + 1)}
                </div>
                <div>{u.direccion_completa}</div>
                <div className="text-neutral-500">{u.ciudad}, {u.estado}{u.codigo_postal ? ' · CP ' + u.codigo_postal : ''}</div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Contacto" onEdit={function () { onEditStep(3); }}>
        <div className="space-y-1 text-xs text-neutral-700">
          <div><span className="text-neutral-400">WhatsApp:</span> +52 {formatPhone(formData.whatsapp)}</div>
          <div><span className="text-neutral-400">Teléfono:</span> +52 {formatPhone(formData.telefono)}</div>
          <div><span className="text-neutral-400">Email:</span> {formData.email}</div>
          {formData.sitio_web && <div><span className="text-neutral-400">Web:</span> {formData.sitio_web}</div>}
          {formData.instagram && <div><span className="text-neutral-400">Instagram:</span> {formData.instagram}</div>}
          {formData.facebook && <div><span className="text-neutral-400">Facebook:</span> {formData.facebook}</div>}
        </div>
      </Section>

      <div className="bg-inbody-red-soft border border-inbody-red/15 rounded-2xl p-4 text-xs text-inbody-red-dark leading-relaxed">
        Al enviar, declaras que la información proporcionada es verídica y que aceptas que el equipo de InBody México la verifique antes de aprobar tu registro en el directorio.
      </div>
    </div>
  );
}

function Section({ title, onEdit, children }) {
  return (
    <div className="border border-neutral-200 rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-400 font-semibold">{title}</div>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-[11px] text-inbody-red hover:underline"
        >
          <Edit2 className="w-2.5 h-2.5" />
          Editar
        </button>
      </div>
      {children}
    </div>
  );
}

function formatPhone(p) {
  if (!p) return '';
  const c = p.replace(/\D/g, '');
  if (c.length === 10) return c.slice(0,2) + ' ' + c.slice(2,6) + ' ' + c.slice(6);
  return p;
}
