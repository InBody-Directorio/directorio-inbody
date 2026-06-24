import { useEffect, useRef, useState } from 'react';
import { X, MapPin, Phone, Mail, Globe, Instagram, Facebook, Sparkles, CheckCircle2, XCircle, RotateCcw, Loader2, AlertCircle, Clock, ZoomIn, Hash } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '../../lib/mapbox.js';
import { getEspecialidadLabel } from '../../config/especialidades.js';
import { getModeloLabel, isModeloDescontinuado } from '../../config/modelos.js';
import ImagenModelo from '../ImagenModelo.jsx';
import { aprobarProfesional, rechazarProfesional, restaurarProfesional } from '../../lib/adminApi.js';

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function ProfesionalDetailModal({ profesional, onClose, onAction }) {
  const [mode, setMode] = useState('view');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zoomFoto, setZoomFoto] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(function () {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (zoomFoto) setZoomFoto(null);
        else if (mode === 'reject_motivo') setMode('view');
        else onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return function () {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, mode, zoomFoto]);

  useEffect(function () {
    if (!profesional || !profesional.ubicaciones || profesional.ubicaciones.length === 0) return;
    const ubicConCoords = profesional.ubicaciones.filter(function (u) { return u.lat && u.lng; });
    if (ubicConCoords.length === 0) return;
    if (!mapContainer.current) return;

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [ubicConCoords[0].lng, ubicConCoords[0].lat],
      zoom: 12,
      attributionControl: false,
    });

    map.current.on('load', function () {
      ubicConCoords.forEach(function (u) {
        const el = document.createElement('div');
        el.className = 'inbody-marker';
        new mapboxgl.Marker({ element: el }).setLngLat([u.lng, u.lat]).addTo(map.current);
      });

      if (ubicConCoords.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        ubicConCoords.forEach(function (u) { bounds.extend([u.lng, u.lat]); });
        map.current.fitBounds(bounds, { padding: 50, duration: 0 });
      }
    });

    return function () {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [profesional]);

  if (!profesional) return null;

  const especialidad = getEspecialidadLabel(profesional.especialidad);
  const modelo = getModeloLabel(profesional.modelo_inbody);
  const descontinuado = isModeloDescontinuado(profesional.modelo_inbody);

  async function handleAprobar() {
    setLoading(true); setError('');
    try {
      await aprobarProfesional(profesional.id);
      onAction && onAction('aprobado');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  async function handleRechazar() {
    setLoading(true); setError('');
    try {
      await rechazarProfesional(profesional.id, motivo.trim() || null);
      onAction && onAction('rechazado');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  async function handleRestaurar() {
    setLoading(true); setError('');
    try {
      await restaurarProfesional(profesional.id);
      onAction && onAction('restaurado');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />
      <div
        onClick={function (e) { e.stopPropagation(); }}
        className="relative bg-white w-full md:max-w-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-fade-in"
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-150 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <StatusBadge status={profesional.status} />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-medium text-neutral-900 leading-tight truncate">{profesional.nombre}</h2>
              <div className="text-xs text-neutral-500">{especialidad}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {profesional.foto_perfil_url && (
                <PhotoCard url={profesional.foto_perfil_url} label="Consultorio / Instalaciones" description="Pública en el directorio" onZoom={function () { setZoomFoto(profesional.foto_perfil_url); }} />
              )}
              {profesional.foto_equipo_url && (
                <PhotoCard url={profesional.foto_equipo_url} label="Equipo InBody" description="Para verificación interna" onZoom={function () { setZoomFoto(profesional.foto_equipo_url); }} />
              )}
            </div>

            {profesional.descripcion_breve && (
              <Section title="Descripción">
                <p className="text-sm text-neutral-700 leading-relaxed">{profesional.descripcion_breve}</p>
              </Section>
            )}

            <Section title="Equipo InBody">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-3 bg-inbody-red-soft/40 border border-inbody-red/15 rounded-2xl">
                  <ImagenModelo modeloId={profesional.modelo_inbody} size="md" className="!bg-white flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-inbody-red-dark">{modelo}</div>
                    {descontinuado && (
                      <div className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[9px] font-semibold text-amber-800 uppercase tracking-wider">
                        Modelo descontinuado
                      </div>
                    )}
                  </div>
                </div>
                {profesional.numero_serie ? (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <Hash className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-amber-800 font-semibold mb-0.5">Número de serie (solo visible para admins)</div>
                      <div className="text-sm font-mono text-amber-900 font-semibold">{profesional.numero_serie}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-neutral-500 italic">
                    Registro legacy: no se solicitó número de serie en este registro.
                  </div>
                )}
              </div>
            </Section>

            <Section title={'Ubicaciones (' + (profesional.ubicaciones || []).length + ')'}>
              <div className="space-y-2.5 mb-4">
                {(profesional.ubicaciones || []).map(function (u, idx) {
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-150">
                      <MapPin className="w-3.5 h-3.5 text-inbody-red flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">
                          {idx === 0 ? 'Principal' : 'Ubicación ' + (idx + 1)}
                        </div>
                        <div className="text-sm text-neutral-900 leading-relaxed">{u.direccion_completa}</div>
                        <div className="text-xs text-neutral-500">{u.ciudad}, {u.estado}{u.codigo_postal ? ' · CP ' + u.codigo_postal : ''}</div>
                        {u.lat && u.lng ? (
                          <div className="text-[10px] text-green-600 mt-1">✓ Coordenadas: {u.lat.toFixed(5)}, {u.lng.toFixed(5)}</div>
                        ) : (
                          <div className="text-[10px] text-amber-600 mt-1">⚠ Sin coordenadas (revisar manualmente)</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div ref={mapContainer} className="rounded-xl overflow-hidden border border-neutral-150" style={{ height: '200px' }} />
            </Section>

            <Section title="Contacto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {profesional.email && <ContactRow icon={<Mail className="w-3.5 h-3.5" />} label="Correo" value={profesional.email} href={'mailto:' + profesional.email} />}
                {profesional.whatsapp && <ContactRow icon={<Phone className="w-3.5 h-3.5" />} label="WhatsApp" value={formatPhone(profesional.whatsapp)} />}
                {profesional.telefono && <ContactRow icon={<Phone className="w-3.5 h-3.5" />} label="Teléfono" value={formatPhone(profesional.telefono)} />}
                {profesional.sitio_web && <ContactRow icon={<Globe className="w-3.5 h-3.5" />} label="Web" value={profesional.sitio_web} href={profesional.sitio_web} external />}
                {profesional.instagram && <ContactRow icon={<Instagram className="w-3.5 h-3.5" />} label="Instagram" value={profesional.instagram} />}
                {profesional.facebook && <ContactRow icon={<Facebook className="w-3.5 h-3.5" />} label="Facebook" value={profesional.facebook} />}
              </div>
            </Section>

            <Section title="Información de la solicitud">
              <div className="space-y-1.5 text-xs">
                <MetaRow icon={<Clock className="w-3 h-3" />} label="Recibida" value={formatDate(profesional.created_at)} />
                {profesional.aprobado_at && <MetaRow icon={<CheckCircle2 className="w-3 h-3" />} label="Aprobada" value={formatDate(profesional.aprobado_at) + (profesional.aprobado_por ? ' por ' + profesional.aprobado_por : '')} />}
                {profesional.rechazado_at && <MetaRow icon={<XCircle className="w-3 h-3" />} label="Rechazada" value={formatDate(profesional.rechazado_at) + (profesional.rechazado_por ? ' por ' + profesional.rechazado_por : '')} />}
                {profesional.motivo_rechazo && (
                  <div className="mt-2 p-3 bg-inbody-red-soft border border-inbody-red/15 rounded-xl">
                    <div className="text-[10px] uppercase tracking-wider text-inbody-red-dark font-semibold mb-1">Motivo del rechazo</div>
                    <div className="text-xs text-inbody-red-dark leading-relaxed">{profesional.motivo_rechazo}</div>
                  </div>
                )}
              </div>
            </Section>
          </div>
        </div>

        <div className="border-t border-neutral-150 p-4 md:p-5 bg-white flex-shrink-0">
          {error && (
            <div className="mb-3 p-3 bg-inbody-red-soft border border-inbody-red/20 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-3.5 h-3.5 text-inbody-red flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-inbody-red-dark">{error}</div>
            </div>
          )}

          {mode === 'view' && (
            <div className="flex items-center justify-end gap-2 flex-wrap">
              {profesional.status === 'pendiente' && (
                <>
                  <button onClick={function () { setMode('reject_motivo'); }} disabled={loading} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-neutral-200 hover:border-inbody-red/30 hover:bg-inbody-red-soft text-neutral-700 hover:text-inbody-red text-sm font-medium transition-all">
                    <XCircle className="w-3.5 h-3.5" />
                    Rechazar
                  </button>
                  <button onClick={handleAprobar} disabled={loading} className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all shadow-lg shadow-green-600/25 disabled:opacity-60">
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Aprobar
                  </button>
                </>
              )}

              {profesional.status === 'aprobado' && (
                <button onClick={function () { setMode('reject_motivo'); }} disabled={loading} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-neutral-200 hover:border-inbody-red/30 text-neutral-700 hover:text-inbody-red text-sm font-medium transition-all">
                  <XCircle className="w-3.5 h-3.5" />
                  Rechazar (quitar del directorio)
                </button>
              )}

              {profesional.status === 'rechazado' && (
                <button onClick={handleRestaurar} disabled={loading} className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-inbody-red text-white text-sm font-semibold transition-all">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  Restaurar a pendiente
                </button>
              )}
            </div>
          )}

          {mode === 'reject_motivo' && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-700 font-medium">
                Motivo del rechazo <span className="text-neutral-400 font-normal">(opcional, se enviará al doctor por correo)</span>
              </div>
              <textarea
                value={motivo}
                onChange={function (e) { setMotivo(e.target.value); }}
                placeholder="Ej. El número de serie no coincide con nuestros registros."
                rows={3}
                maxLength={500}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20 rounded-xl text-sm transition-all outline-none resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button onClick={function () { setMode('view'); setMotivo(''); }} disabled={loading} className="px-4 py-2 rounded-full text-sm text-neutral-700 hover:bg-neutral-100 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleRechazar} disabled={loading} className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-inbody-red hover:bg-inbody-red-hover text-white text-sm font-semibold transition-all shadow-lg shadow-inbody-red/25 disabled:opacity-60">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Confirmar rechazo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {zoomFoto && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-900/90 backdrop-blur-md p-4 animate-fade-in" onClick={function () { setZoomFoto(null); }}>
          <button onClick={function () { setZoomFoto(null); }} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
          <img src={zoomFoto} alt="Zoom" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'pendiente') {
    return <div className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-[10px] font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />Pendiente</div>;
  }
  if (status === 'aprobado') {
    return <div className="px-2.5 py-1 rounded-full bg-green-100 border border-green-200 text-[10px] font-semibold uppercase tracking-wider text-green-800 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" />Aprobado</div>;
  }
  if (status === 'rechazado') {
    return <div className="px-2.5 py-1 rounded-full bg-inbody-red-soft border border-inbody-red/20 text-[10px] font-semibold uppercase tracking-wider text-inbody-red-dark flex items-center gap-1"><XCircle className="w-2.5 h-2.5" />Rechazado</div>;
  }
  return null;
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-400 font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function PhotoCard({ url, label, description, onZoom }) {
  return (
    <div className="relative group cursor-pointer rounded-xl overflow-hidden border border-neutral-200" onClick={onZoom}>
      <img src={url} alt={label} className="w-full h-40 md:h-48 object-cover" />
      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ZoomIn className="w-3.5 h-3.5" />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">{label}</div>
        <div className="text-[11px] text-white/90">{description}</div>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value, href, external }) {
  const content = (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-neutral-50 transition-colors group">
      <div className="w-6 h-6 rounded-md bg-neutral-100 group-hover:bg-inbody-red-soft text-neutral-500 group-hover:text-inbody-red flex items-center justify-center flex-shrink-0 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">{label}</div>
        <div className="text-xs text-neutral-900 truncate">{value}</div>
      </div>
    </div>
  );
  if (href) return <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{content}</a>;
  return content;
}

function MetaRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-neutral-600">
      <div className="text-neutral-400">{icon}</div>
      <span className="text-neutral-400">{label}:</span>
      <span className="text-neutral-700">{value}</span>
    </div>
  );
}

function formatPhone(p) {
  if (!p) return '';
  const c = p.replace(/\D/g, '');
  if (c.length === 10) return '+52 ' + c.slice(0,2) + ' ' + c.slice(2,6) + ' ' + c.slice(6);
  return p;
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
