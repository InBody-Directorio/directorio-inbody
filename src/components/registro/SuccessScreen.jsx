import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, Clock } from 'lucide-react';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';

export default function SuccessScreen({ email, nombre }) {
  return (
    <div className="bg-neutral-50 min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          <div className="bg-white border border-neutral-200 rounded-3xl p-7 md:p-9 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-display text-3xl font-light text-neutral-900 mb-2">¡Listo {nombre}!</h1>
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              Recibimos tu solicitud de registro al Directorio InBody México.
            </p>

            <div className="bg-neutral-50 rounded-2xl p-4 mb-5 text-left border border-neutral-150">
              <div className="flex items-start gap-3 mb-3">
                <Mail className="w-4 h-4 text-inbody-red flex-shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-700 leading-relaxed">
                  Te enviamos un correo de confirmación a <strong>{email}</strong> con un resumen de tu solicitud.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-inbody-red flex-shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-700 leading-relaxed">
                  En las próximas <strong>3 a 5 días hábiles</strong> el equipo de InBody México verificará tu información y te notificaremos cuando estés aprobado.
                </div>
              </div>
            </div>

            <Link to="/" className="inline-flex items-center text-sm text-inbody-red hover:underline">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
