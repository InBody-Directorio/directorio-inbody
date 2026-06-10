import { Instagram, Facebook, Youtube, Mail, Phone, Globe } from 'lucide-react';
import InBodyLogo from './InBodyLogo.jsx';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 pb-12 border-b border-white/10">
          <div className="md:col-span-2">
            <InBodyLogo size={26} className="text-white mb-5" />
            <p className="text-sm text-neutral-400 leading-relaxed max-w-md mb-6">
              El directorio oficial de profesionales certificados con equipo InBody en México. Encuentra mediciones precisas de composición corporal cerca de ti.
            </p>
            <div className="flex items-center gap-3">
              <SocialLink href="https://www.instagram.com/inbodymexico/" icon={<Instagram className="w-4 h-4" />} label="Instagram" />
              <SocialLink href="https://www.facebook.com/InBodyMexico" icon={<Facebook className="w-4 h-4" />} label="Facebook" />
              <SocialLink href="https://www.youtube.com/@inbodymexico" icon={<Youtube className="w-4 h-4" />} label="YouTube" />
              <SocialLink href="https://www.inbodymexico.com" icon={<Globe className="w-4 h-4" />} label="Sitio web" />
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-semibold mb-4">
              Directorio
            </div>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li><a href="/" className="hover:text-white transition-colors">Buscar profesionales</a></li>
              <li><a href="/registro" className="hover:text-white transition-colors">Registrar mi equipo</a></li>
              <li><a href="https://www.inbodymexico.com" target="_blank" rel="noopener" className="hover:text-white transition-colors">Conocer InBody</a></li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-semibold mb-4">
              Contacto
            </div>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <a href="mailto:contacto@inbodymexico.com" className="hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  contacto@inbodymexico.com
                </a>
              </li>
              <li>
                <a href="tel:+525555555555" className="hover:text-white transition-colors flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  +52 55 5555 5555
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-xs text-neutral-500">
            © {year} InBody México. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-5 text-xs text-neutral-500">
            <a href="#" className="hover:text-white transition-colors">Aviso de privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos y condiciones</a>
          </div>
        </div>

        <div className="mt-6 text-[10px] text-neutral-600 text-center md:text-right uppercase tracking-wider">
          Desarrollado por MKT LAB
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-inbody-red border border-white/[0.06] hover:border-inbody-red flex items-center justify-center text-neutral-400 hover:text-white transition-all duration-200"
    >
      {icon}
    </a>
  );
}
