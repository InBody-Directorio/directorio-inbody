import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CtaProfesionales() {
  return (
    <div className="bg-gradient-to-br from-inbody-red via-inbody-red to-inbody-red-dark text-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16 text-center">
        <Sparkles className="w-7 h-7 mx-auto mb-4 opacity-80" />
        <h2 className="font-display text-2xl md:text-4xl font-light tracking-tight mb-3 leading-tight">
          ¿Eres profesional con equipo <span className="font-medium">InBody</span>?
        </h2>
        <p className="text-sm md:text-base text-white/80 max-w-2xl mx-auto leading-relaxed mb-6">
          Aparece en el directorio oficial. Tus futuros pacientes te encontrarán fácilmente buscando por ciudad o especialidad.
        </p>
        <Link
          to="/registro"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-inbody-red text-sm font-semibold hover:bg-neutral-50 transition-colors shadow-lg"
        >
          Registrarme gratis
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
