/**
 * Logo InBody.
 *
 * SVG con texto Lato Black (tipografía oficial del brandbook InBody v1.0.1).
 * Color por defecto: InBody Red oficial (#971B2F).
 *
 * - variant="red"   (default): rojo InBody, para fondos claros
 * - variant="white"          : blanco, para fondos oscuros (footer, CTA)
 *
 * Si InBody nos manda el PNG oficial del logo, se puede reemplazar el contenido
 * de este componente por <img src="/logo-inbody.png" />.
 */
export default function InBodyLogo({ className = '', size = 24, variant = 'red' }) {
  const color = variant === 'white' ? '#FFFFFF' : '#971B2F';
  return (
    <svg
      viewBox="0 0 200 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ height: size, width: 'auto', display: 'block' }}
      aria-label="InBody"
      preserveAspectRatio="xMidYMid meet"
    >
      <text
        x="0"
        y="48"
        fontFamily="Lato, 'Noto Sans', system-ui, -apple-system, sans-serif"
        fontSize="56"
        fontWeight="900"
        fill={color}
        letterSpacing="-2"
      >
        InBody
      </text>
    </svg>
  );
}
