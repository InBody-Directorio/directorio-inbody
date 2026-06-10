/**
 * Modelos de equipos InBody disponibles en el directorio.
 *
 * Convención de nombres: SIN espacio entre "InBody" y el número (InBody970S, no InBody 970).
 *
 * Campo `descontinuado`: marca modelos antiguos. Por ahora todos en false,
 * se actualizará cuando InBody nos pase la lista oficial (Tanda 2).
 */

export const MODELOS_INBODY = [
  {
    id: 'inbody970',
    label: 'InBody970',
    descripcion: 'El modelo más avanzado, uso clínico premium.',
    descontinuado: false,
  },
  {
    id: 'inbody970s',
    label: 'InBody970S',
    descripcion: 'Versión compacta del 970.',
    descontinuado: false,
  },
  {
    id: 'inbody770',
    label: 'InBody770',
    descripcion: 'Equipo de uso profesional con análisis avanzado.',
    descontinuado: false,
  },
  {
    id: 'inbody580',
    label: 'InBody580',
    descripcion: 'Análisis profesional para consultorios y gimnasios.',
    descontinuado: false,
  },
  {
    id: 'inbody570',
    label: 'InBody570',
    descripcion: 'Equipo profesional con función adicional de hidratación.',
    descontinuado: false,
  },
  {
    id: 'inbody380',
    label: 'InBody380',
    descripcion: 'Solución portátil para consultorios pequeños.',
    descontinuado: false,
  },
  {
    id: 'inbody370s',
    label: 'InBody370S',
    descripcion: 'Modelo intermedio para análisis profesional.',
    descontinuado: false,
  },
  {
    id: 'inbody370',
    label: 'InBody370',
    descripcion: 'Modelo intermedio para análisis profesional.',
    descontinuado: false,
  },
  {
    id: 'inbody270',
    label: 'InBody270',
    descripcion: 'Compacto y eficaz, ideal para fitness y gimnasios.',
    descontinuado: false,
  },
  {
    id: 'inbody230',
    label: 'InBody230',
    descripcion: 'Equipo de entrada para análisis básico.',
    descontinuado: false,
  },
  {
    id: 'inbody120',
    label: 'InBody120',
    descripcion: 'Equipo portátil para mediciones rápidas.',
    descontinuado: false,
  },
  {
    id: 'inbodyh20n',
    label: 'InBodyH20N',
    descripcion: 'Báscula inteligente de uso doméstico y profesional.',
    descontinuado: false,
  },
  {
    id: 'inbodydial',
    label: 'InBodyDial',
    descripcion: 'Báscula compacta para uso personal.',
    descontinuado: false,
  },
  {
    id: 'inbodyband2',
    label: 'InBodyBand2',
    descripcion: 'Wearable de seguimiento corporal.',
    descontinuado: false,
  },
  {
    id: 'inbodybpbio',
    label: 'InBodyBPBio',
    descripcion: 'Monitor de presión arterial.',
    descontinuado: false,
  },
  {
    id: 'otro',
    label: 'Otro modelo',
    descripcion: 'Si tienes otro modelo, déjanos saber por favor en la descripción.',
    descontinuado: false,
  },
];

/**
 * Obtiene el label de un modelo por su ID.
 * Hace fallback al ID capitalizado si no se encuentra (para registros legacy).
 */
export function getModeloLabel(id) {
  if (!id) return 'Sin equipo';
  const found = MODELOS_INBODY.find(function (m) { return m.id === id; });
  if (found) return found.label;

  // Fallback legacy: "inbody-770" → "InBody770"
  const clean = id.replace(/[-\s_]/g, '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Devuelve true si el modelo está descontinuado.
 */
export function isModeloDescontinuado(id) {
  const found = MODELOS_INBODY.find(function (m) { return m.id === id; });
  return found ? !!found.descontinuado : false;
}
