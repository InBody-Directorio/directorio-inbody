// Listado oficial de modelos InBody vigentes en México.
// Aprobado por InBody México (Azalea Martínez) - Abril 2026.

export const MODELOS_INBODY = [
  // Línea básica
  { id: 'inbody-120', label: 'InBody 120', categoria: 'basica' },
  { id: 'inbody-170', label: 'InBody 170', categoria: 'basica' },
  { id: 'inbody-230', label: 'InBody 230', categoria: 'basica' },

  // Línea profesional
  { id: 'inbody-270', label: 'InBody 270', categoria: 'profesional' },
  { id: 'inbody-270s', label: 'InBody 270S', categoria: 'profesional' },
  { id: 'inbody-370', label: 'InBody 370', categoria: 'profesional' },
  { id: 'inbody-370s', label: 'InBody 370S', categoria: 'profesional' },
  { id: 'inbody-570', label: 'InBody 570', categoria: 'profesional' },
  { id: 'inbody-580', label: 'InBody 580', categoria: 'profesional' },

  // Línea premium
  { id: 'inbody-770', label: 'InBody 770', categoria: 'premium' },
  { id: 'inbody-770s', label: 'InBody 770S', categoria: 'premium' },
  { id: 'inbody-970', label: 'InBody 970', categoria: 'premium' },
  { id: 'inbody-970s', label: 'InBody 970S', categoria: 'premium' },

  // Línea clínica especializada
  { id: 'inbody-s10', label: 'InBody S10', categoria: 'clinica' },
  { id: 'inbody-bwa-2', label: 'InBody BWA 2.0', categoria: 'clinica' },
  { id: 'inbody-bwa-2s', label: 'InBody BWA 2.0S', categoria: 'clinica' },
];

export const getModeloById = (id) => MODELOS_INBODY.find((m) => m.id === id);
export const getModeloLabel = (id) => {
  const found = getModeloById(id);
  return found ? found.label : id;
};
