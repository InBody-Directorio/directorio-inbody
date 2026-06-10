import { useEffect, useState } from 'react';
import { X, MapPin, Phone, Mail, Globe, Instagram, Facebook, Sparkles, Navigation, Share2, Check } from 'lucide-react';
import { getEspecialidadLabel } from '../config/especialidades.js';
import { getModeloLabel } from '../config/modelos.js';

export default function ProfesionalModal({ profesional, ubicacion, onClose }) {
  const [shareState, setShareState] = useState('idle'); // idle | copied

  useEffect(
    function () {
      function onKey(e) {
        if (e.key === 'Escape') onClose();
      }
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
      return function () {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
      };
    },
    [onClose]
  );

  if (!profesional) return null;

  const especialidad = getEspecialidadLabel(profesional.especialidad);
  const modelo = getModeloLabel(profesional.modelo_inbody);
  const foto = profesional.foto_perfil_url || (ubicacion && ubicacion.foto_lugar_url) || '';

  const whatsappLink = profesional.whatsapp
    ? 'https://wa.me/' +
      profesional.whatsapp.replace(/\D/g, '') +
      '?text=' +
      encodeURIComponent(
        'Hola, te contacto desde el directorio oficial de InBody México. Me interesa agendar una consulta contigo.'
      )
    : '';

  const mapsLink = ubicacion
    ? 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(ubicacion.direccion_completa + ', ' + ubicacion.ciudad)
    : '';

  function handleShare() {
    const shareText =
      profesional.nombre + ' (' + especialidad + ')' +
      (ubicacion ? ' · ' + ubicacion.ciudad + ', ' + ubicacion.estado : '') +
      '\n\nEncontrado en el Directorio Oficial de InBody México';
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: profesional.nombre + ' · InBody México',
        text: shareText,
        url: shareUrl,
      }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText + '\n' + shareUrl).then(function () {
        setShareState('copied');
        setTimeout(function () {
          setShareState('idle');
        }, 2000);
      });
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />

      <div
        onClick={function (e) {
          e.stopPropagation();
        }}
        className="relative bg-white w-full md:max-w-md md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)' }}
      >
        <div className="relative flex-shrink-0">
          {foto ? (
            <img src={foto} alt={profesional.nombre} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-neutral-400" />
            </div>
          )}

          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-black/45 backdrop-blur-md hover:bg-black/60 text-white flex items-center justify-center transition-colors"
              title="Compartir"
            >
              {shareState === 'copied' ? (
                <Check className="w-4 h-4 text-green-300" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/45 backdrop-blur-md hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-neutral-900 shadow-sm">
            <Sparkles className="w-3 h-3 text-inbody-red" />
            {modelo}
          </div>

          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] font-medium text-white tracking-wider">Disponible</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          <h2 className="font-display text-2xl font-medium text-neutral-900 leading-tight tracking-tight mb-1">
            {profesional.nombre}
          </h2>
          <div className="text-sm text-neutral-500 mb-5">{especialidad}</div>

          {profesional.descripcion_breve && (
            <p className="text-sm text-neutral-600 leading-relaxed mb-5">
              {profesional.descripcion_breve}
            </p>
          )}

          {ubicacion && (
            <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-2xl mb-5 border border-neutral-150">
              <MapPin className="w-4 h-4 text-inbody-red flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-neutral-900 leading-relaxed">
                  {ubicacion.direccion_completa}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {ubicacion.ciudad}, {ubicacion.estado}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 mb-5">
            {profesional.telefono && (
              <ContactRow
                icon={<Phone className="w-3.5 h-3.5" />}
                label="Teléfono"
                value={profesional.telefono}
                href={'tel:' + profesional.telefono}
              />
            )}
            {profesional.email && (
              <ContactRow
                icon={<Mail className="w-3.5 h-3.5" />}
                label="Correo"
                value={profesional.email}
                href={'mailto:' + profesional.email}
              />
            )}
            {profesional.sitio_web && (
              <ContactRow
                icon={<Globe className="w-3.5 h-3.5" />}
                label="Sitio web"
                value={profesional.sitio_web.replace(/^https?:\/\//, '')}
                href={profesional.sitio_web}
                external
              />
            )}
            {profesional.instagram && (
              <ContactRow
                icon={<Instagram className="w-3.5 h-3.5" />}
                label="Instagram"
                value={profesional.instagram}
                href={'https://instagram.com/' + profesional.instagram.replace('@', '')}
                external
              />
            )}
            {profesional.facebook && (
              <ContactRow
                icon={<Facebook className="w-3.5 h-3.5" />}
                label="Facebook"
                value={profesional.facebook}
                href={profesional.facebook}
                external
              />
            )}
          </div>
        </div>

        <div className="border-t border-neutral-150 p-4 md:p-5 bg-white flex-shrink-0">
          <div className="grid grid-cols-1 gap-2">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-inbody-red hover:bg-inbody-red-hover text-white text-sm font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-inbody-red/25"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
                </svg>
                Agendar por WhatsApp
              </a>
            )}
            <div className="grid grid-cols-2 gap-2">
              {profesional.telefono && (
                <a
                  href={'tel:' + profesional.telefono}
                  className="flex items-center justify-center gap-2 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-900 text-xs font-medium py-2.5 rounded-xl transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Llamar
                </a>
              )}
              {mapsLink && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-900 text-xs font-medium py-2.5 rounded-xl transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Cómo llegar
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function ContactRow({ icon, label, value, href, external }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors group"
    >
      <div className="w-7 h-7 rounded-lg bg-neutral-100 group-hover:bg-inbody-red-soft flex items-center justify-center text-neutral-500 group-hover:text-inbody-red transition-colors flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
          {label}
        </div>
        <div className="text-sm text-neutral-900 truncate">{value}</div>
      </div>
    </a>
  );
}
