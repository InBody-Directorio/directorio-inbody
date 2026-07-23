import { Globe2, Award, Building2 } from 'lucide-react';

export default function MarcaAutoridad() {
  const stats = [
    {
      icon: <Globe2 className="w-4 h-4" />,
      value: '90+',
      label: 'países',
      description: 'Presencia global en clínicas, hospitales y centros deportivos.',
    },
    {
      icon: <Award className="w-4 h-4" />,
      value: '30+',
      label: 'años',
      description: 'Innovando en tecnología de análisis de composición corporal.',
    },
    {
      icon: <Building2 className="w-4 h-4" />,
      value: '8,000+',
      label: 'publicaciones',
      description: 'Validado científicamente en estudios médicos a nivel mundial.',
    },
  ];

  return (
    <section className="bg-neutral-50 py-16 md:py-24 px-4 md:px-6 border-t border-neutral-200/60">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="text-[11px] uppercase tracking-[0.15em] text-inbody-red font-semibold mb-3">
            La marca
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-light tracking-tight leading-[1.1] text-neutral-900 mb-4">
            InBody, <em className="italic font-light text-inbody-red">líder mundial</em> <br className="hidden md:block" />
            en composición corporal
          </h2>
          <p className="text-sm md:text-base text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            La tecnología más confiable y precisa para medir grasa corporal, masa muscular, agua corporal y más. Utilizada por médicos, atletas olímpicos y hospitales a nivel mundial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {stats.map(function (s, idx) {
            return (
              <div
                key={idx}
                className="relative p-6 md:p-8 rounded-2xl bg-white border border-neutral-200/80 hover:border-inbody-red/20 hover:shadow-lg hover:shadow-inbody-red/5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-inbody-red-soft border border-inbody-red/15 flex items-center justify-center text-inbody-red mb-5">
                  {s.icon}
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-display text-4xl md:text-5xl font-light text-neutral-900 tracking-tight tabular-nums">
                    {s.value}
                  </span>
                  <span className="text-sm text-neutral-500 font-medium">{s.label}</span>
                </div>
                <p className="text-sm text-neutral-500 leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
