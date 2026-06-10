import { Search } from 'lucide-react';

export default function HeroBar({ value, onChange }) {
  return (
    <div className="bg-gradient-to-br from-white via-neutral-50 to-white border-b border-neutral-150">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16 text-center">
        <div className="text-[11px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-3">
          Directorio Oficial · México
        </div>
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-neutral-900 leading-[1.05] mb-4 md:mb-6">
          Encuentra tu profesional<br className="hidden md:block" /> certificado con <span className="font-medium text-inbody-red">InBody</span>
        </h1>
        <p className="text-sm md:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-6 md:mb-8">
          Busca al especialista más cercano. Todos cuentan con equipo InBody verificado por nuestro equipo en México.
        </p>
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={value}
            onChange={function (e) { onChange(e.target.value); }}
            placeholder="Buscar por nombre, ciudad o especialidad..."
            className="w-full pl-11 md:pl-12 pr-4 py-3.5 md:py-4 bg-white border border-neutral-200 focus:border-inbody-red/30 focus:ring-4 focus:ring-inbody-red/10 rounded-full text-sm md:text-base transition-all outline-none shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
