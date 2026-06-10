import { MousePointerClick } from 'lucide-react';

export default function OnboardingHint() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
      <div className="flex items-center gap-2 text-[11px] text-neutral-500 justify-center">
        <MousePointerClick className="w-3 h-3 text-inbody-red" />
        Da clic en cualquier pin del mapa o tarjeta para ver los detalles
      </div>
    </div>
  );
}
