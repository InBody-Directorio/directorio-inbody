import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Globe } from 'lucide-react';

export default function CtaProfesionales() {
  const benefits = [
    { icon: <Globe className="w-3.5 h-3.5" />, text: 'Visibilidad nacional' },
    { icon: <Users className="w-3.5 h-3.5" />, text: 'Pacientes calificados' },
    { icon: <Sparkles className="w-3.5 h-3.5" />, text: 'Sin costo, sin comisiones' },
  ];

  return (
    <section className="relative bg-neutral-900 text-white py-16 md:py-24 px-4 md:px-6 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '28px 28px',
      }} />

      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-inbody-red/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-inbody-red/10 blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <div className="text-[11px] uppercase tracking-[0.15em] text-inbody-red font-semibold mb-3">
            Para profesionales
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-light tracking-tight leading-[1.05] mb-5">
            ¿Eres profesional <br />
            con un <em className="italic font-light text-inbody-red">InBody?</em>
          </h2>
          <p className="text-sm md:text-base text-neutral-400 leading-relaxed mb-8 max-w-md">
            Aparece en el directorio oficial de InBody México y conecta con pacientes que buscan mediciones de composición corporal con la mejor tecnología.
          </p>

          <Link
            to="/registro"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-inbody-red text-neutral-900 hover:text-white text-sm font-medium transition-all duration-200 group"
          >
            <span>Registrar mi equipo</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="space-y-3 md:pl-8">
          {benefits.map(function (b, idx) {
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-inbody-red/15 border border-inbody-red/20 flex items-center justify-center text-inbody-red flex-shrink-0">
                  {b.icon}
                </div>
                <div className="text-sm md:text-base font-medium text-white">{b.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
