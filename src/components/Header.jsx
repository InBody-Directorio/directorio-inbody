import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import InBodyLogo from './InBodyLogo.jsx';

export default function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-neutral-200/60 px-4 md:px-6 h-14 flex items-center justify-between flex-shrink-0 z-30 relative">
      <Link to="/" className="flex items-center gap-3 group">
        <InBodyLogo size={22} className="text-inbody-red transition-transform group-hover:scale-105" />
        <div className="hidden sm:flex items-center gap-3">
          <div className="h-4 w-px bg-neutral-300" />
          <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 font-medium">
            Directorio oficial · México
          </span>
        </div>
      </Link>

      <Link
        to="/registro"
        className="group flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-neutral-900 hover:bg-inbody-red text-white text-xs md:text-sm font-medium transition-all duration-200"
      >
        <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-300" />
        <span className="hidden sm:inline">Registrar mi equipo</span>
        <span className="sm:hidden">Registrar</span>
      </Link>
    </header>
  );
}
