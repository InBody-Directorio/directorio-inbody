import { ShieldCheck, BadgeCheck, Award } from 'lucide-react';

export default function MarcaAutoridad() {
  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
          <div className="flex md:flex-col items-center gap-3 md:gap-2 justify-center">
            <ShieldCheck className="w-5 h-5 text-inbody-red flex-shrink-0" />
            <div className="text-xs md:text-[13px] text-neutral-700 text-left md:text-center">
              <strong className="text-neutral-900">Verificación oficial</strong> por el equipo de InBody México
            </div>
          </div>
          <div className="flex md:flex-col items-center gap-3 md:gap-2 justify-center md:border-x md:border-neutral-200 md:px-4">
            <BadgeCheck className="w-5 h-5 text-inbody-red flex-shrink-0" />
            <div className="text-xs md:text-[13px] text-neutral-700 text-left md:text-center">
              <strong className="text-neutral-900">Equipos verificados</strong> por número de serie
            </div>
          </div>
          <div className="flex md:flex-col items-center gap-3 md:gap-2 justify-center">
            <Award className="w-5 h-5 text-inbody-red flex-shrink-0" />
            <div className="text-xs md:text-[13px] text-neutral-700 text-left md:text-center">
              <strong className="text-neutral-900">Profesionales certificados</strong> en composición corporal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
