import { Check } from 'lucide-react';

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 md:gap-3">
        {steps.map(function (step, idx) {
          const isActive = idx === currentStep;
          const isComplete = idx < currentStep;
          return (
            <div key={step.id} className="flex-1 flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div
                  className={
                    'w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all flex-shrink-0 ' +
                    (isComplete
                      ? 'bg-inbody-red text-white'
                      : isActive
                      ? 'bg-neutral-900 text-white ring-4 ring-neutral-900/10'
                      : 'bg-neutral-150 text-neutral-400')
                  }
                >
                  {isComplete ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <div className="hidden md:block min-w-0">
                  <div
                    className={
                      'text-xs font-medium leading-tight truncate ' +
                      (isActive || isComplete ? 'text-neutral-900' : 'text-neutral-400')
                    }
                  >
                    {step.title}
                  </div>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-px bg-neutral-200 relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-inbody-red transition-all duration-500"
                    style={{ width: isComplete ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="md:hidden mt-3 text-center">
        <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">
          Paso {currentStep + 1} de {steps.length}
        </div>
        <div className="text-sm font-medium text-neutral-900">
          {steps[currentStep].title}
        </div>
      </div>
    </div>
  );
}
