/**
 * Logo InBody usando el PNG real desde public/.
 * Soporta variante 'red' (default) y 'white' para fondos oscuros.
 *
 * Ratio aproximado: 3.45 : 1 (ancho:alto)
 */
export default function InBodyLogo({ variant = 'red', size = 24, className = '' }) {
  const src = variant === 'white' ? '/logo-inbody-white.png' : '/logo-inbody.png';

  return (
    <img
      src={src}
      alt="InBody"
      className={className}
      style={{
        height: size,
        width: 'auto',
        display: 'block',
        userSelect: 'none',
      }}
      draggable={false}
    />
  );
}
