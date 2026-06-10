import InBodyLogo from './InBodyLogo.jsx';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 mt-12 md:mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <InBodyLogo className="h-7 w-auto text-white mb-3" />
            <p className="text-xs leading-relaxed text-neutral-500">
              Directorio Oficial de profesionales certificados con equipo InBody en México.
            </p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-300 font-semibold mb-3">Contacto</div>
            <div className="space-y-1.5 text-xs">
              <div><a href="https://www.inbodymexico.com" className="hover:text-white transition-colors">inbodymexico.com</a></div>
              <div><a href="mailto:directorioinbody@gmail.com" className="hover:text-white transition-colors">directorioinbody@gmail.com</a></div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-300 font-semibold mb-3">¿Eres profesional?</div>
            <p className="text-xs leading-relaxed text-neutral-500 mb-2">
              Si tienes un equipo InBody en México, regístrate gratis y aparece en el directorio.
            </p>
            <a href="/registro" className="text-xs text-inbody-red hover:underline">Registrarme →</a>
          </div>
        </div>
        <div className="border-t border-neutral-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px]">
          <div>© {new Date().getFullYear()} InBody México · Todos los derechos reservados</div>
          <div className="text-neutral-600">Desarrollado por MKT LAB</div>
        </div>
      </div>
    </footer>
  );
}
