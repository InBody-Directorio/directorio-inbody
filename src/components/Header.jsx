import { Link } from 'react-router-dom';
import InBodyLogo from './InBodyLogo.jsx';

export default function Header() {
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <InBodyLogo className="h-7 w-auto text-inbody-red" />
          <div className="hidden sm:block border-l border-neutral-200 pl-2.5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 font-semibold leading-tight">Directorio</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-900 font-semibold leading-tight">Oficial México</div>
          </div>
        </Link>
        <Link
          to="/registro"
          className="px-4 py-2 rounded-full bg-inbody-red hover:bg-inbody-red-hover text-white text-xs md:text-sm font-semibold transition-colors shadow-sm"
        >
          Registrarme
        </Link>
      </div>
    </header>
  );
}
