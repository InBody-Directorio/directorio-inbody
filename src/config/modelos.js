/**
 * Modelos de equipos InBody disponibles en el directorio.
 *
 * Catálogo final aprobado por InBody México (Aza) — Junio 2026:
 * - Descontinuados (siguen visibles para legacy, pero ya no se ofrecen): 570, 370S, 270, 230
 * - Borrados del catálogo (línea personal/consumer): Dial, H20N, Band2
 * - Renombrado: BPBio → BPBIO750
 * - Nuevos: BWA (Body Water Analyzer), S10 (hospitalario)
 *
 * Convención de IDs: SIN espacio, SIN guión, todo minúscula.
 * Convención de labels: SIN espacio entre "InBody" y el número/sufijo.
 *
 * Campo `descontinuado`: marca modelos que ya no se venden. Sigue apareciendo
 * en perfiles legacy pero no en el selector de registro.
 *
 * Campo `imagen`: ruta a la imagen PNG transparente en /public/modelos/.
 * Si no existe el archivo, el componente ImagenModelo muestra un placeholder elegante.
 */

export const MODELOS_INBODY = [
  // Línea profesional vigente — premium
  {
    id: 'inbody970',
    label: 'InBody970',
    descripcion: 'El modelo más avanzado, uso clínico premium.',
    descontinuado: false,
    imagen: '/modelos/inbody970.png',
  },
  {
    id: 'inbody970s',
    label: 'InBody970S',
    descripcion: 'Versión flagship con tecnología 3MHz.',
    descontinuado: false,
    imagen: '/modelos/inbody970s.png',
  },

  // Línea profesional vigente — alta gama
  {
    id: 'inbody770',
    label: 'InBody770',
    descripcion: 'Equipo de uso profesional con análisis avanzado.',
    descontinuado: false,
    imagen: '/modelos/inbody770.png',
  },
  {
    id: 'inbody770s',
    label: 'InBody770S',
    descripcion: 'Versión actualizada del 770 con tecnología 3MHz.',
    descontinuado: false,
    imagen: '/modelos/inbody770s.png',
  },

  // Línea profesional vigente — media
  {
    id: 'inbody580',
    label: 'InBody580',
    descripcion: 'Análisis profesional para consultorios y gimnasios.',
    descontinuado: false,
    imagen: '/modelos/inbody580.png',
  },
  {
    id: 'inbody380',
    label: 'InBody380',
    descripcion: 'Solución compacta para consultorios.',
    descontinuado: false,
    imagen: '/modelos/inbody380.png',
  },
  {
    id: 'inbody370',
    label: 'InBody370',
    descripcion: 'Modelo intermedio para análisis profesional.',
    descontinuado: false,
    imagen: '/modelos/inbody370.png',
  },

  // Línea profesional vigente — entrada
  {
    id: 'inbody270s',
    label: 'InBody270S',
    descripcion: 'Versión actualizada del 270 con tecnología profesional.',
    descontinuado: false,
    imagen: '/modelos/inbody270s.png',
  },
  {
    id: 'inbody120',
    label: 'InBody120',
    descripcion: 'Equipo portátil para mediciones rápidas.',
    descontinuado: false,
    imagen: '/modelos/inbody120.png',
  },

  // Línea hospitalaria
  {
    id: 'inbodys10',
    label: 'InBodyS10',
    descripcion: 'Análisis de composición corporal para uso hospitalario en cama.',
    descontinuado: false,
    imagen: '/modelos/inbodys10.png',
  },

  // Línea especializada
  {
    id: 'inbodybwa',
    label: 'InBodyBWA',
    descripcion: 'Body Water Analyzer — análisis de hidratación corporal.',
    descontinuado: false,
    imagen: '/modelos/inbodybwa.png',
  },
  {
    id: 'bpbio750',
    label: 'BPBIO750',
    descripcion: 'Monitor automático de presión arterial.',
    descontinuado: false,
    imagen: '/modelos/bpbio750.png',
  },

  // Descontinuados (ya no se venden, pero quedan visibles para perfiles legacy)
  {
    id: 'inbody570',
    label: 'InBody570',
    descripcion: 'Equipo profesional con función adicional de hidratación.',
    descontinuado: true,
    imagen: '/modelos/inbody570.png',
  },
  {
    id: 'inbody370s',
    label: 'InBody370S',
    descripcion: 'Modelo intermedio actualizado para análisis profesional.',
    descontinuado: true,
    imagen: '/modelos/inbody370s.png',
  },
  {
    id: 'inbody270',
    label: 'InBody270',
    descripcion: 'Compacto y eficaz, ideal para fitness y gimnasios.',
    descontinuado: true,
    imagen: '/modelos/inbody270.png',
  },
  {
    id: 'inbody230',
    label: 'InBody230',
    descripcion: 'Equipo de entrada para análisis básico.',
    descontinuado: true,
    imagen: '/modelos/inbody230.png',
  },

  // Otro
  {
    id: 'otro',
    label: 'Otro modelo',
    descripcion: 'Si tienes otro modelo, indícanos cuál en la descripción.',
    descontinuado: false,
    imagen: null,
  },
];

/**
 * Obtiene el label de un modelo por su ID.
 * Hace fallback al ID capitalizado si no se encuentra (para registros legacy
 * que tenían IDs como "inbodydial", "inbodyh20n", "inbodyband2", "inbodybpbio").
 */
export function getModeloLabel(id) {
  if (!id) return 'Sin equipo';
  const found = MODELOS_INBODY.find(function (m) { return m.id === id; });
  if (found) return found.label;
  // Fallback para legacy: capitalizar primera letra y devolver
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

/**
 * Obtiene la ruta a la imagen del modelo.
 * Devuelve null si no tiene imagen registrada.
 */
export function getModeloImagen(id) {
  const found = MODELOS_INBODY.find(function (m) { return m.id === id; });
  return found ? found.imagen : null;
}

/**
 * Obtiene todo el objeto del modelo por ID.
 */
export function getModelo(id) {
  return MODELOS_INBODY.find(function (m) { return m.id === id; });
}

/**
 * Devuelve solo los modelos NO descontinuados, para el selector del registro.
 * Los descontinuados siguen apareciendo en perfiles legacy via getModeloLabel.
 */
export function getModelosVigentes() {
  return MODELOS_INBODY.filter(function (m) { return !m.descontinuado; });
}
