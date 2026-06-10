/**
 * Modelos de equipos InBody disponibles en el directorio.
 *
 * Convención de nombres: SIN espacio entre "InBody" y el número (InBody970S, no InBody 970).
 *
 * Campo `descontinuado`: marca modelos antiguos. Por ahora todos en false,
 * se actualizará cuando InBody nos pase la lista oficial (Tanda 2).
 *
 * Campo `imagen`: ruta a la imagen PNG transparente en /public/modelos/.
 * Si no existe el archivo, el componente ImagenModelo muestra un placeholder elegante.
 *
 * Para agregar imágenes oficiales: ponerlas en /public/modelos/ con el nombre
 * exacto del id, ejemplo: /public/modelos/inbody970s.png
 */

export const MODELOS_INBODY = [
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
  {
    id: 'inbody580',
    label: 'InBody580',
    descripcion: 'Análisis profesional para consultorios y gimnasios.',
    descontinuado: false,
    imagen: '/modelos/inbody580.png',
  },
  {
    id: 'inbody570',
    label: 'InBody570',
    descripcion: 'Equipo profesional con función adicional de hidratación.',
    descontinuado: false,
    imagen: '/modelos/inbody570.png',
  },
  {
    id: 'inbody380',
    label: 'InBody380',
    descripcion: 'Solución compacta para consultorios.',
    descontinuado: false,
    imagen: '/modelos/inbody380.png',
  },
  {
    id: 'inbody370s',
    label: 'InBody370S',
    descripcion: 'Modelo intermedio actualizado para análisis profesional.',
    descontinuado: false,
    imagen: '/modelos/inbody370s.png',
  },
  {
    id: 'inbody370',
    label: 'InBody370',
    descripcion: 'Modelo intermedio para análisis profesional.',
    descontinuado: false,
    imagen: '/modelos/inbody370.png',
  },
  {
    id: 'inbody270',
    label: 'InBody270',
    descripcion: 'Compacto y eficaz, ideal para fitness y gimnasios.',
    descontinuado: false,
    imagen: '/modelos/inbody270.png',
  },
  {
    id: 'inbody270s',
    label: 'InBody270S',
    descripcion: 'Versión actualizada del 270 con tecnología profesional.',
    descontinuado: false,
    imagen: '/modelos/inbody270s.png',
  },
  {
    id: 'inbody230',
    label: 'InBody230',
    descripcion: 'Equipo de entrada para análisis básico.',
    descontinuado: false,
    imagen: '/modelos/inbody230.png',
  },
  {
    id: 'inbody120',
    label: 'InBody120',
    descripcion: 'Equipo portátil para mediciones rápidas.',
    descontinuado: false,
    imagen: '/modelos/inbody120.png',
  },
  {
    id: 'inbodyh20n',
    label: 'InBodyH20N',
    descripcion: 'Báscula inteligente de uso doméstico y profesional.',
    descontinuado: false,
    imagen: '/modelos/inbodyh20n.png',
  },
  {
    id: 'inbodydial',
    label: 'InBodyDial',
    descripcion: 'Báscula compacta para uso personal.',
    descontinuado: false,
    imagen: '/modelos/inbodydial.png',
  },
  {
    id: 'inbodyband2',
    label: 'InBodyBand2',
    descripcion: 'Wearable de seguimiento corporal.',
    descontinuado: false,
    imagen: '/modelos/inbodyband2.png',
  },
  {
    id: 'inbodybpbio',
    label: 'InBodyBPBio',
    descripcion: 'Monitor de presión arterial.',
    descontinuado: false,
    imagen: '/modelos/inbodybpbio.png',
  },
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
 * Hace fallback al ID capitalizado si no se encuentra (para registros legacy).
 */
export function getModeloLabel(id) {
  if (!id) return 'Sin equipo';
  const found = MODELOS_INBODY.find(function (m) { return m.id === id; });
  if (found) return found.label;
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
