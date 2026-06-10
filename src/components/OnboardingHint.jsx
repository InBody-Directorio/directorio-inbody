import { useState, useEffect } from 'react';
import { X, MapPin, Filter, Crosshair, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'inbody_directorio_onboarding_v1';

export default function OnboardingHint() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(function () {
    // Mostrar solo si nunca lo han visto
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        const timer = setTimeout(function () {
          setVisible(true);
        }, 1200);
        return function () {
          clearTimeout(timer);
        };
      }
    } catch (e) {
      // localStorage no disponible (incógnito en algunos navegadores)
    }
  }, []);

  function handleDismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {}
  }

  function handleNext() {
    if (step < tips.length - 1) {
      setStep(step + 1);
    } else {
      handleDismiss();
    }
  }

  const tips = [
    {
      icon: <MapPin className="w-5 h-5" />,
      title: 'Explora el mapa',
      description: 'Cada pin rojo es un profesional certificado con equipo InBody. Da clic para ver sus datos.',
    },
    {
      icon: <Filter className="w-5 h-5" />,
      title: 'Filtra por especialidad',
      description: 'Usa los filtros arriba para encontrar al profesional que necesitas: nutrición, medicina del deporte, fisioterapia y más.',
    },
    {
      icon: <Crosshair className="w-5 h-5" />,
      title: 'Encuentra cerca de ti',
      description: 'Usa el botón circular abajo a la derecha del mapa para centrarlo en tu ubicación actual.',
    },
  ];

  if (!visible) return null;

  const tip = tips[step];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-auto animate-fade-in"
        onClick={handleDismiss}
      />

      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full pointer-events-auto overflow-hidden"
        style={{ animation: 'slideUp 0.35s cubic-bezier(0.2, 0.9, 0.3, 1)' }}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="p-6 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-inbody-red-soft to-white border border-inbody-red/15 flex items-center justify-center text-inbody-red">
              {tip.icon}
            </div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 font-semibold">
              Paso {step + 1} de {tips.length}
            </div>
          </div>

          <h3 className="font-display text-2xl font-light tracking-tight text-neutral-900 mb-2 leading-tight">
            {tip.title}
          </h3>
          <p className="text-sm text-neutral-500 leading-relaxed mb-6">
            {tip.description}
          </p>

          <div className="flex items-center gap-1.5 mb-5">
            {tips.map(function (_, idx) {
              return (
                <div
                  key={idx}
                  className={
                    'h-1 rounded-full transition-all ' +
                    (idx === step
                      ? 'w-6 bg-inbody-red'
                      : idx < step
                      ? 'w-1.5 bg-inbody-red/40'
                      : 'w-1.5 bg-neutral-200')
                  }
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleDismiss}
              className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
            >
              Saltar tutorial
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 hover:bg-inbody-red text-white text-xs font-medium transition-colors"
            >
              {step === tips.length - 1 ? 'Comenzar' : 'Siguiente'}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
