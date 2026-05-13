import { useEffect, useState } from 'react';
import { MapPin, Activity, Users } from 'lucide-react';

export default function HeroBar({ totalProfesionales, totalEstados, totalEspecialidades }) {
  return (
    <div className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200/60 px-4 md:px-6 py-5 md:py-6 flex-shrink-0 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #18181a 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }} />

      <div className="relative max-w-4xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-inbody-red-soft border border-inbody-red/15">
            <div className="relative">
              <div className="w-1.5 h-1.5 rounded-full bg-inbody-red" />
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-inbody-red animate-ping opacity-75" />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-inbody-red-dark">
              En vivo
            </span>
          </div>
        </div>

        <h1 className="font-display text-2xl md:text-4xl font-light tracking-tight leading-[1.05] text-neutral-900 mb-2">
          Encuentra tu equipo InBody <em className="italic font-light text-inbody-red">cerca de ti</em>
        </h1>
        <p className="text-xs md:text-sm text-neutral-500 leading-relaxed max-w-xl mb-4 md:mb-5">
          Profesionales certificados con tecnología de composición corporal líder en el mundo.
        </p>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <StatChip
            icon={<Users className="w-3 h-3" />}
            value={totalProfesionales}
            label={'profesional' + (totalProfesionales === 1 ? '' : 'es')}
          />
          <StatChip
            icon={<MapPin className="w-3 h-3" />}
            value={totalEstados}
            label={'estado' + (totalEstados === 1 ? '' : 's')}
          />
          <StatChip
            icon={<Activity className="w-3 h-3" />}
            value={totalEspecialidades}
            label={'especialidad' + (totalEspecialidades === 1 ? '' : 'es')}
          />
        </div>
      </div>
    </div>
  );
}

function StatChip({ icon, value, label }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(function () {
    if (typeof value !== 'number') return;
    let start = 0;
    const duration = 800;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200/80 rounded-full text-xs font-medium text-neutral-700 shadow-sm">
      <span className="text-inbody-red">{icon}</span>
      <span className="font-semibold text-neutral-900 tabular-nums">{displayValue}</span>
      <span className="text-neutral-500">{label}</span>
    </div>
  );
}
