import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/70 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0 z-20">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-1.5 h-7 bg-inbody-red rounded-sm" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium leading-none">
            InBody
          </span>
          <span className="text-sm font-medium text-neutral-900 leading-tight">
            Directorio México
          </span>
        </div>
      </Link>

      <Link
        to="/registro"
        className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full bg-neutral-900 text-white text-xs md:text-sm font-medium hover:bg-neutral-800 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Registrar mi equipo</span>
        <span className="sm:hidden">Registrar</span>
      </Link>
    </header>
  );
}
