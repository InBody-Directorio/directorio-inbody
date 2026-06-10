import { Check } from 'lucide-react';

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-1 md:gap-2">
        {steps.map(function (step, idx) {
          const isComplete = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div
                  className={
                    'w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-semibold transition-all ' +
                    (isComplete ? 'bg-inbody-red text-white' :
                     isActive ? 'bg-neutral-900 text-white ring-4 ring-neutral-900/10' :
                     'bg-neutral-100 text-neutral-400')
                  }
                >
                  {isComplete ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <div className={'hidden md:block text-[10px] uppercase tracking-wider font-semibold ' + (isActive ? 'text-neutral-900' : 'text-neutral-400')}>
                  {step.title}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={'flex-1 h-px mx-1.5 md:mx-2 mt-3.5 md:mt-4 ' + (isComplete ? 'bg-inbody-red' : 'bg-neutral-200')} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
