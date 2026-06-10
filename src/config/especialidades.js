/**
 * Especialidades del Directorio InBody México
 *
 * Lista oficial aprobada por InBody en junio 2026.
 * IDs nuevos en kebab-case para URLs amigables.
 *
 * Para los registros viejos con IDs anteriores (nutricion, bariatria, etc.),
 * getEspecialidadLabel hace fallback al ID capitalizado.
 */

export const ESPECIALIDADES = [
  {
    id: 'nutricion-clinica',
    label: 'Nutrición Clínica',
    description: 'Consultorios de nutrición especializada en composición corporal y planes terapéuticos.',
  },
  {
    id: 'fitness-deportes',
    label: 'Fitness / Deportes / Gimnasios',
    description: 'Gimnasios, estudios de entrenamiento, clubes deportivos y centros de alto rendimiento.',
  },
  {
    id: 'hospitalario-investigacion',
    label: 'Uso Hospitalario / Gobierno / Investigación / Universidades',
    description: 'Hospitales públicos o privados, dependencias de gobierno, centros de investigación y universidades.',
  },
  {
    id: 'practica-medica-privada',
    label: 'Especialidad en práctica médica privada',
    description: 'Consultorios médicos privados con especialidad en bariatría, endocrinología, medicina interna, etc.',
  },
  {
    id: 'spa-medicina-estetica',
    label: 'SPAs / Medicina Estética',
    description: 'Centros de medicina estética, spas y clínicas de bienestar.',
  },
  {
    id: 'corporativo-bienestar',
    label: 'Corporativos / Empresas / Bienestar laboral',
    description: 'Programas de salud corporativa, bienestar laboral y wellness empresarial.',
  },
];

/**
 * Obtiene el label de una especialidad por su ID.
 * Si el ID no está en la lista actual (registros viejos), devuelve el ID capitalizado
 * para que no se rompa la UI mientras Aza migra manualmente.
 */
export function getEspecialidadLabel(id) {
  if (!id) return 'Sin especialidad';
  const found = ESPECIALIDADES.find(function (e) { return e.id === id; });
  if (found) return found.label;

  // Fallback para registros legacy (ej. "nutricion" → "Nutrición")
  return id.split('-').map(function (w) {
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

/**
 * Devuelve true si el ID es uno de la lista actual (no legacy).
 */
export function isEspecialidadVigente(id) {
  return ESPECIALIDADES.some(function (e) { return e.id === id; });
}
