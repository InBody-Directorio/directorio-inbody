import { getEspecialidadLabel } from '../config/especialidades.js';
import { getModeloLabel } from '../config/modelos.js';

/**
 * Convierte un array de profesionales (con sus ubicaciones) a CSV.
 * El CSV usa BOM UTF-8 para que Excel abra acentos correctamente.
 */
export function profesionalesToCSV(profesionales) {
  const headers = [
    'Nombre',
    'Categoría',
    'Modelo InBody',
    'Número de serie',
    'WhatsApp',
    'Teléfono',
    'Email',
    'Sitio web',
    'Instagram',
    'Facebook',
    'Descripción',
    'Status',
    'Ubicaciones',
    'Ciudades',
    'Estados',
    'Fecha recibida',
    'Fecha aprobada',
    'Aprobado por',
    'Fecha rechazada',
    'Rechazado por',
    'Motivo de rechazo',
  ];

  const rows = profesionales.map(function (p) {
    const ubicaciones = (p.ubicaciones || []).map(function (u) {
      return (u.direccion_completa || '') + ', ' + (u.ciudad || '') + ', ' + (u.estado || '') + (u.codigo_postal ? ' CP ' + u.codigo_postal : '');
    }).join(' | ');

    const ciudades = (p.ubicaciones || []).map(function (u) { return u.ciudad || ''; }).filter(Boolean).join(' | ');
    const estados = (p.ubicaciones || []).map(function (u) { return u.estado || ''; }).filter(Boolean).join(' | ');

    return [
      p.nombre || '',
      getEspecialidadLabel(p.especialidad),
      getModeloLabel(p.modelo_inbody),
      p.numero_serie || '',
      p.whatsapp ? '+52 ' + p.whatsapp : '',
      p.telefono ? '+52 ' + p.telefono : '',
      p.email || '',
      p.sitio_web || '',
      p.instagram || '',
      p.facebook || '',
      p.descripcion_breve || '',
      p.status || '',
      ubicaciones,
      ciudades,
      estados,
      formatDate(p.created_at),
      formatDate(p.aprobado_at),
      p.aprobado_por || '',
      formatDate(p.rechazado_at),
      p.rechazado_por || '',
      p.motivo_rechazo || '',
    ];
  });

  const escape = function (val) {
    if (val === null || val === undefined) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const csvLines = [headers.map(escape).join(',')];
  rows.forEach(function (row) {
    csvLines.push(row.map(escape).join(','));
  });

  return '\uFEFF' + csvLines.join('\n');
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Dispara la descarga del CSV en el navegador.
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename || 'profesionales.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}
