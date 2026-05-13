import { Instagram, Facebook, Linkedin, Globe, ArrowUpRight } from 'lucide-react';
import InBodyLogo from './InBodyLogo.jsx';

export default function Footer() {
  const year = new Date().getFullYear();

  const socials = [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/inbodymx',
      icon: <Instagram className="w-4 h-4" />,
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/InBodyEnMexico',
      icon: <Facebook className="w-4 h-4" />,
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/inbodymx/',
      icon: <Linkedin className="w-4 h-4" />,
    },
    {
      label: 'TikTok',
      href: 'https://www.tiktok.com/@inbodymx',
      icon: <TikTokIcon className="w-4 h-4" />,
    },
    {
      label: 'Sitio web',
      href: 'https://www.inbodymexico.com',
      icon: <Globe className="w-4 h-4" />,
    },
  ];

  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 pb-12 border-b border-white/10">
          <div className="md:col-span-2">
            <InBodyLogo size={28} className="text-white mb-5" />
            <p className="text-sm text-neutral-400 leading-relaxed max-w-md mb-6">
              El directorio oficial de profesionales certificados con equipo InBody en México. Encuentra mediciones precisas de composición corporal cerca de ti.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {socials.map(function (s) {
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-inbody-red border border-white/[0.06] hover:border-inbody-red flex items-center justify-center text-neutral-400 hover:text-white transition-all duration-200"
                  >
                    {s.icon}
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-semibold mb-4">
              Enlaces
            </div>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Buscar profesionales
                </a>
              </li>
              <li>
                <a href="/registro" className="hover:text-white transition-colors">
                  Registrar mi equipo
                </a>
              </li>
              <li>
                <a
                  href="https://www.inbodymexico.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  Conocer InBody
                  <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.inbodymexico.com/contacto/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  Contacto
                  <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
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
            <a
              href="https://www.inbodymexico.com/aviso-de-privacidad/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors inline-flex items-center gap-1 group"
            >
              Aviso de privacidad
              <ArrowUpRight className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        <div className="mt-6 text-[11px] text-neutral-600 text-center md:text-right tracking-wide">
          Desarrollado con{' '}
          <span className="text-inbody-red">♥</span>{' '}
          por{' '}
          <a
            href="https://marketinglab.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
          >
            MKT LAB
            <ArrowUpRight className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </footer>
  );
}

// Lucide no tiene TikTok, lo agrego custom
function TikTokIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.93a8.16 8.16 0 0 0 4.77 1.52V7a4.86 4.86 0 0 1-1.84-.31z" />
    </svg>
  );
}
