// Listado oficial de especialidades aceptadas en el directorio.
// Aprobado por InBody México (Azalea Martínez) - Abril 2026.
// Para agregar/quitar especialidades, edita este archivo y haz commit.

export const ESPECIALIDADES = [
  { id: 'nutricion', label: 'Nutrición' },
  { id: 'medicina-general', label: 'Medicina general' },
  { id: 'endocrinologia', label: 'Endocrinología' },
  { id: 'medicina-deportiva', label: 'Medicina deportiva' },
  { id: 'fisioterapia', label: 'Fisioterapia y rehabilitación' },
  { id: 'gimnasio', label: 'Gimnasio o club deportivo' },
  { id: 'estetica-corporal', label: 'Estética corporal o spa' },
  { id: 'bariatria-gastro', label: 'Bariatría / Gastroenterología' },
  { id: 'nefrologia-dialisis', label: 'Nefrología / Centros de Diálisis' },
  { id: 'medicina-estetica', label: 'Medicina estética' },
  { id: 'cirugia-plastica', label: 'Cirugía Plástica' },
  { id: 'clinica-hospital', label: 'Clínica u hospital' },
  { id: 'medicina-interna', label: 'Medicina Interna' },
];

export const getEspecialidadById = (id) => ESPECIALIDADES.find((e) => e.id === id);
export const getEspecialidadLabel = (id) => {
  const found = getEspecialidadById(id);
  return found ? found.label : id;
};
