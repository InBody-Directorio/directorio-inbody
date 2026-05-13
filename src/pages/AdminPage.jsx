import { Link } from 'react-router-dom';

export default function AdminPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-display text-4xl font-light mb-2">Panel de administración</h1>
        <p className="text-neutral-500 text-sm mb-6">Esta página se construye en el Bloque 4</p>
        <Link to="/" className="text-inbody-red text-sm hover:underline">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
