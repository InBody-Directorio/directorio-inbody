import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { getModeloImagen, getModelo } from '../config/modelos.js';

/**
 * Muestra la imagen del modelo InBody.
 * Si la imagen no se carga (404), muestra un placeholder SVG elegante.
 */
export default function ImagenModelo({ modeloId, size = 'md', className = '' }) {
  const [errored, setErrored] = useState(false);
  const modelo = getModelo(modeloId);
  const imagen = getModeloImagen(modeloId);

  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const sizeClass = sizes[size] || sizes.md;

  if (imagen && !errored) {
    return (
      <div className={'flex items-center justify-center bg-neutral-50 rounded-xl overflow-hidden ' + sizeClass + ' ' + className}>
        <img
          src={imagen}
          alt={modelo ? modelo.label : 'Equipo InBody'}
          className="w-full h-full object-contain p-1"
          onError={function () { setErrored(true); }}
          loading="lazy"
        />
      </div>
    );
  }

  // Placeholder elegante: gradiente InBody Red soft + ícono Sparkles
  return (
    <div className={'flex items-center justify-center bg-gradient-to-br from-inbody-red-soft via-white to-inbody-red-soft/50 border border-inbody-red/10 rounded-xl ' + sizeClass + ' ' + className}>
      <Sparkles className="text-inbody-red/60" strokeWidth={1.4} style={{ width: '40%', height: '40%' }} />
    </div>
  );
}
