import { Search, MessageCircle, Activity } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: <Search className="w-5 h-5" />,
      title: 'Busca',
      description:
        'Filtra por especialidad o estado y encuentra al profesional ideal con tecnología InBody cerca de ti.',
    },
    {
      num: '02',
      icon: <MessageCircle className="w-5 h-5" />,
      title: 'Contacta',
      description:
        'Agenda tu cita directamente por WhatsApp o llamada con un solo clic. Sin intermediarios.',
    },
    {
      num: '03',
      icon: <Activity className="w-5 h-5" />,
      title: 'Conócete',
      description:
        'Recibe un análisis preciso de tu composición corporal con la tecnología líder a nivel mundial.',
    },
  ];

  return (
    <section className="bg-white py-16 md:py-24 px-4 md:px-6 border-t border-neutral-200/60">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="text-[11px] uppercase tracking-[0.15em] text-inbody-red font-semibold mb-3">
            Cómo funciona
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-light tracking-tight leading-[1.1] text-neutral-900 mb-4">
            Tres pasos para conocer <em className="italic font-light text-inbody-red">tu cuerpo</em>
          </h2>
          <p className="text-sm md:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
            La forma más simple de acceder a una medición profesional de composición corporal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {steps.map(function (step, idx) {
            return (
              <div key={step.num} className="relative group">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[60%] right-[-20%] h-px bg-gradient-to-r from-neutral-300 to-transparent" />
                )}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-inbody-red-soft to-white border border-inbody-red/15 flex items-center justify-center text-inbody-red flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <div className="font-display text-3xl md:text-4xl font-light text-neutral-300 tabular-nums">
                      {step.num}
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-medium text-neutral-900 mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
