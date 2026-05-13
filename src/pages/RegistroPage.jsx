import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Stepper from '../components/registro/Stepper.jsx';
import Step1Info from '../components/registro/Step1Info.jsx';
import Step2Equipo from '../components/registro/Step2Equipo.jsx';
import Step3Ubicacion from '../components/registro/Step3Ubicacion.jsx';
import Step4Contacto from '../components/registro/Step4Contacto.jsx';
import ResumenSolicitud from '../components/registro/ResumenSolicitud.jsx';
import SuccessScreen from '../components/registro/SuccessScreen.jsx';
import { ESPECIALIDADES } from '../config/especialidades.js';
import { MODELOS_INBODY } from '../config/modelos.js';
import { crearRegistro, checkEmailDuplicado } from '../lib/registro.js';

const STEPS = [
  { id: 'info', title: 'Información' },
  { id: 'equipo', title: 'Equipo InBody' },
  { id: 'ubicacion', title: 'Ubicación' },
  { id: 'contacto', title: 'Contacto' },
  { id: 'resumen', title: 'Revisar y enviar' },
];

const INITIAL_FORM = {
  nombre: '',
  especialidad: '',
  descripcion_breve: '',
  foto_perfil: null,
  modelo_inbody: '',
  foto_equipo: null,
  ubicaciones: [{ direccion_completa: '', ciudad: '', estado: '', codigo_postal: '', lat: null, lng: null, geo_status: 'idle' }],
  whatsapp: '',
  telefono: '',
  email: '',
  sitio_web: '',
  instagram: '',
  facebook: '',
  honeypot: '',
  consentimiento_privacidad: false,
};

export default function RegistroPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Confirmar antes de cerrar la pestaña si hay datos llenados
  useEffect(
    function () {
      function handleBeforeUnload(e) {
        const hasData = formData.nombre || formData.email || formData.whatsapp;
        if (hasData && !submitted) {
          e.preventDefault();
          e.returnValue = '';
        }
      }
      window.addEventListener('beforeunload', handleBeforeUnload);
      return function () {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    },
    [formData, submitted]
  );

  // Previews de fotos (para mostrarlas en el resumen)
  const fotoPreviews = useMemo(
    function () {
      return {
        perfil: formData.foto_perfil ? URL.createObjectURL(formData.foto_perfil) : null,
        equipo: formData.foto_equipo ? URL.createObjectURL(formData.foto_equipo) : null,
      };
    },
    [formData.foto_perfil, formData.foto_equipo]
  );

  function updateField(key, value) {
    setFormData(function (prev) {
      return { ...prev, [key]: value };
    });
    // Limpiar error de ese campo cuando lo modifican
    if (errors[key]) {
      setErrors(function (prev) {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validateStep(stepIdx) {
    const newErrors = {};

    if (stepIdx === 0) {
      if (!formData.nombre || formData.nombre.trim().length < 3) {
        newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      }
      if (!formData.especialidad) {
        newErrors.especialidad = 'Selecciona una especialidad';
      }
      if (!formData.foto_perfil) {
        newErrors.foto_perfil = 'Sube una foto de perfil';
      }
    }

    if (stepIdx === 1) {
      if (!formData.modelo_inbody) {
        newErrors.modelo_inbody = 'Selecciona el modelo de tu equipo';
      }
      if (!formData.foto_equipo) {
        newErrors.foto_equipo = 'Sube una foto de tu equipo InBody';
      }
    }

    if (stepIdx === 2) {
      (formData.ubicaciones || []).forEach(function (u, idx) {
        const ubicErrors = {};
        if (!u.direccion_completa || u.direccion_completa.trim().length < 5) {
          ubicErrors.direccion_completa = 'Ingresa una dirección completa';
        }
        if (!u.ciudad) ubicErrors.ciudad = 'Ingresa la ciudad';
        if (!u.estado) ubicErrors.estado = 'Selecciona el estado';
        if (Object.keys(ubicErrors).length > 0) {
          newErrors['ubicacion_' + idx] = ubicErrors;
        }
      });
    }

    if (stepIdx === 3) {
      const cleanWA = (formData.whatsapp || '').replace(/\D/g, '');
      if (cleanWA.length !== 10) {
        newErrors.whatsapp = 'WhatsApp debe tener 10 dígitos';
      }
      const cleanTel = (formData.telefono || '').replace(/\D/g, '');
      if (cleanTel.length !== 10) {
        newErrors.telefono = 'Teléfono debe tener 10 dígitos';
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(formData.email || '')) {
        newErrors.email = 'Ingresa un correo válido';
      }
      if (!formData.consentimiento_privacidad) {
        newErrors.consentimiento_privacidad = 'Debes aceptar el aviso de privacidad para continuar';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleNext() {
    if (!validateStep(step)) {
      // Scroll al primer error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Verificar duplicados de email cuando termina el paso 4
    if (step === 3) {
      try {
        const duplicado = await checkEmailDuplicado(formData.email);
        if (duplicado) {
          setErrors({
            email: 'Ya existe una solicitud con este correo. Si necesitas corregir información de un envío previo, espera a que el equipo te contacte.',
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } catch (err) {
        // Si falla la verificación, no bloqueamos, dejamos pasar
        console.warn('No se pudo verificar duplicado:', err);
      }
    }

    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setStep(Math.max(0, step - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToStep(idx) {
    setStep(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');

    try {
      // 1. Crear el registro en Supabase (incluye subir fotos)
      const result = await crearRegistro(formData);

      // 2. Llamar a la API serverless para mandar correos
      const especialidadObj = ESPECIALIDADES.find(function (e) {
        return e.id === formData.especialidad;
      });
      const modeloObj = MODELOS_INBODY.find(function (m) {
        return m.id === formData.modelo_inbody;
      });

      const apiPayload = {
        nombre: formData.nombre,
        especialidad: formData.especialidad,
        especialidad_label: especialidadObj ? especialidadObj.label : formData.especialidad,
        descripcion_breve: formData.descripcion_breve,
        modelo_inbody: formData.modelo_inbody,
        modelo_inbody_label: modeloObj ? modeloObj.label : formData.modelo_inbody,
        whatsapp: formData.whatsapp,
        telefono: formData.telefono,
        email: formData.email,
        sitio_web: formData.sitio_web,
        instagram: formData.instagram,
        facebook: formData.facebook,
        ubicaciones: (formData.ubicaciones || []).map(function (u) {
          return {
            direccion_completa: u.direccion_completa,
            ciudad: u.ciudad,
            estado: u.estado,
            codigo_postal: u.codigo_postal,
            lat: u.lat,
            lng: u.lng,
          };
        }),
        foto_perfil_url: result.fotoPerfilUrl,
        foto_equipo_url: result.fotoEquipoUrl,
        honeypot: formData.honeypot,
        consentimiento_privacidad: formData.consentimiento_privacidad,
      };

      const apiResponse = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });

      if (!apiResponse.ok) {
        const errData = await apiResponse.json().catch(function () { return {}; });
        throw new Error(errData.error || 'Error al enviar la solicitud');
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Error al enviar registro:', err);
      setSubmitError(err.message || 'Algo salió mal. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <SuccessScreen email={formData.email} nombre={formData.nombre.split(' ')[0]} />;
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="bg-neutral-50 min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Volver al directorio
          </Link>

          {/* Stepper */}
          <div className="mb-8 md:mb-10">
            <Stepper steps={STEPS} currentStep={step} />
          </div>

          {/* Card del paso actual */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm">
            {step === 0 && <Step1Info formData={formData} updateField={updateField} errors={errors} />}
            {step === 1 && <Step2Equipo formData={formData} updateField={updateField} errors={errors} />}
            {step === 2 && <Step3Ubicacion formData={formData} updateField={updateField} errors={errors} />}
            {step === 3 && <Step4Contacto formData={formData} updateField={updateField} errors={errors} />}
            {step === 4 && (
              <ResumenSolicitud
                formData={formData}
                onEditStep={goToStep}
                fotoPreviews={fotoPreviews}
              />
            )}
          </div>

          {/* Error global */}
          {submitError && (
            <div className="mt-4 p-4 bg-inbody-red-soft border border-inbody-red/20 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-inbody-red flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-inbody-red-dark leading-relaxed">
                <strong>No pudimos enviar tu solicitud.</strong> {submitError}
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="mt-6 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-sm font-medium transition-all disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
            ) : (
              <div />
            )}

            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-inbody-red text-white text-sm font-medium transition-all"
              >
                Siguiente
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-inbody-red hover:bg-inbody-red-hover text-white text-sm font-semibold transition-all shadow-lg shadow-inbody-red/25 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar solicitud
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
