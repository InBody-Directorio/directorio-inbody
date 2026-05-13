import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, Clock, ArrowRight, Home } from 'lucide-react';

export default function SuccessScreen({ email, nombre }) {
  return (
    <div className="bg-neutral-50 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 md:p-10 text-center shadow-sm">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-inbody-red-soft to-white border border-inbody-red/15 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-inbody-red" strokeWidth={1.5} />
            </div>
            <div className="absolute inset-0 rounded-full bg-inbody-red/10 animate-ping" style={{ animationDuration: '2s' }} />
          </div>

          <div className="text-[10px] uppercase tracking-[0.14em] text-inbody-red font-semibold mb-3">
            Solicitud enviada
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight text-neutral-900 leading-[1.1] mb-3">
            ¡Gracias{nombre ? ', ' : ''}<em className="italic font-light text-inbody-red">{nombre || 'estás dentro'}</em>!
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed mb-8 max-w-sm mx-auto">
            Recibimos tu información y la guardamos en nuestro sistema. El equipo de InBody México la revisará en los próximos días.
          </p>

          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-start gap-3 p-4 bg-neutral-50 border border-neutral-150 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-inbody-red flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-neutral-900 mb-0.5">
                  3 a 5 días hábiles
                </div>
                <div className="text-[11px] text-neutral-500 leading-relaxed">
                  Tiempo aproximado de revisión por el equipo de InBody México.
                </div>
              </div>
            </div>

            {email && (
              <div className="flex items-start gap-3 p-4 bg-neutral-50 border border-neutral-150 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-inbody-red flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-neutral-900 mb-0.5">
                    Confirmación enviada
                  </div>
                  <div className="text-[11px] text-neutral-500 leading-relaxed break-all">
                    Te llegó un correo con el resumen a <strong>{email}</strong>. Si no lo encuentras, revisa tu carpeta de spam.
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-900 hover:bg-inbody-red text-white text-sm font-medium transition-all duration-200 group"
          >
            <Home className="w-4 h-4" />
            Volver al directorio
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="text-center mt-6 text-[11px] text-neutral-400">
          ¿Tienes dudas? Escribe a{' '}
          <a href="https://www.inbodymexico.com/contacto/" target="_blank" rel="noopener noreferrer" className="text-inbody-red hover:underline">
            inbodymexico.com/contacto
          </a>
        </div>
      </div>
    </div>
  );
}
