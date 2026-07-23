/**
 * Modelos de equipos InBody disponibles en el directorio.
 *
 * Catálogo final aprobado por InBody México (Aza) — Junio 2026.
 *
 * IMPORTANTE: Todas las funciones de búsqueda son CASE-INSENSITIVE.
 * En la base de datos pueden existir registros legacy con IDs como
 * "Inbody770", "INBODY570", "inbody770", etc. Las funciones normalizan
 * a minúsculas antes de comparar para evitar mismatches.
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
    nuevaGeneracion: true,
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
    nuevaGeneracion: true,
    imagen: '/modelos/inbody770s.png',
  },

  // Línea profesional vigente — media
  {
    id: 'inbody580',
    label: 'InBody580',
    descripcion: 'Análisis profesional para consultorios y gimnasios.',
    descontinuado: false,
    nuevaGeneracion: true,
    imagen: '/modelos/inbody580.png',
  },
  {
    id: 'inbody380',
    label: 'InBody380',
    descripcion: 'Solución compacta para consultorios.',
    descontinuado: false,
    nuevaGeneracion: true,
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
    // Pedido de ventas (jul 2026): NO aparece en el selector del registro,
    // pero se conserva aquí como fallback para registros existentes en BD
    // (label, imagen y detección siguen funcionando).
    ocultoEnSelector: true,
    imagen: '/modelos/bpbio750.png',
  },

  // Descontinuados (siguen visibles en el selector y en perfiles legacy)
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
 * Normaliza un ID a minúsculas y sin espacios/guiones para búsqueda.
 */
function normalize(id) {
  if (!id) return '';
  return String(id).toLowerCase().replace(/[-\s_]/g, '');
}

/**
 * Busca un modelo por ID (case-insensitive).
 * Encuentra "Inbody770", "INBODY770", "inbody770", "InBody770", etc.
 */
export function getModelo(id) {
  if (!id) return null;
  const norm = normalize(id);
  return MODELOS_INBODY.find(function (m) { return normalize(m.id) === norm; }) || null;
}

/**
 * Devuelve el label correctamente formateado del modelo.
 * Si el modelo existe en el catálogo, devuelve su label oficial (ej: "InBody770").
 * Si NO existe (legacy desconocido), intenta formatearlo bonito.
 */
export function getModeloLabel(id) {
  if (!id) return 'Sin equipo';
  const found = getModelo(id);
  if (found) return found.label;

  // Fallback para IDs legacy desconocidos: intentar formatear como "InBody{NNN}"
  const norm = normalize(id);
  // Si empieza con "inbody" seguido de números/letras, formatear como "InBody{...}"
  const match = norm.match(/^inbody(.+)$/);
  if (match) {
    return 'InBody' + match[1].toUpperCase();
  }
  // Si no, capitalizar primera letra
  return id.charAt(0).toUpperCase() + id.slice(1);
}

/**
 * Devuelve true si el modelo está descontinuado (case-insensitive).
 */
export function isModeloDescontinuado(id) {
  const found = getModelo(id);
  return found ? !!found.descontinuado : false;
}

/**
 * Devuelve true si el modelo es de nueva generación (case-insensitive).
 * Leyenda "Nueva generación" pedida por ventas (jul 2026) para:
 * InBody380, InBody580, InBody970S, InBody770S.
 */
export function isModeloNuevaGeneracion(id) {
  const found = getModelo(id);
  return found ? !!found.nuevaGeneracion : false;
}

/**
 * Devuelve la ruta a la imagen del modelo (case-insensitive).
 * Devuelve null si no tiene imagen registrada.
 */
export function getModeloImagen(id) {
  const found = getModelo(id);
  return found ? found.imagen : null;
}

/**
 * Devuelve TODOS los modelos para el selector del registro.
 * Los descontinuados aparecen al final con sufijo "(Descontinuado)" en el label.
 * Lo pidió Aza explícitamente: hay que dejarlos visibles.
 */
export function getModelosParaSelector() {
  const vigentes = MODELOS_INBODY.filter(function (m) {
    return !m.descontinuado && m.id !== 'otro' && !m.ocultoEnSelector;
  });
  const descontinuados = MODELOS_INBODY.filter(function (m) { return m.descontinuado; });
  const otro = MODELOS_INBODY.filter(function (m) { return m.id === 'otro'; });

  // Marcar descontinuados con sufijo en el label para que el usuario lo vea claro
  const descontinuadosMarcados = descontinuados.map(function (m) {
    return { ...m, label: m.label + ' (Descontinuado)' };
  });

  return vigentes.concat(descontinuadosMarcados).concat(otro);
}

/**
 * Devuelve solo los modelos NO descontinuados (excluyendo "otro").
 * Útil para filtros o vistas donde no quieres mostrar los descontinuados.
 */
export function getModelosVigentes() {
  return MODELOS_INBODY.filter(function (m) {
    return !m.descontinuado && m.id !== 'otro';
  });
}
