import { Search, MapPin, MessageCircle } from 'lucide-react';

const STEPS = [
  { icon: Search, title: 'Busca', text: 'Filtra por especialidad, ciudad o modelo InBody.' },
  { icon: MapPin, title: 'Ubica', text: 'Encuentra al profesional más cercano en el mapa.' },
  { icon: MessageCircle, title: 'Contacta', text: 'Mándale mensaje directo por WhatsApp.' },
];

export default function HowItWorks() {
  return (
    <div className="bg-neutral-50 border-y border-neutral-200">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="text-center mb-8">
          <div className="text-[11px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-2">¿Cómo funciona?</div>
          <h2 className="font-display text-2xl md:text-3xl font-light tracking-tight text-neutral-900">Encuentra a tu especialista en 3 pasos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map(function (s, idx) {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-white border border-neutral-200 rounded-2xl p-5 text-center">
                <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-inbody-red-soft flex items-center justify-center">
                  <Icon className="w-5 h-5 text-inbody-red" />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Paso {idx + 1}</div>
                <div className="font-display text-lg font-medium text-neutral-900 mb-1">{s.title}</div>
                <div className="text-xs text-neutral-500 leading-relaxed">{s.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
