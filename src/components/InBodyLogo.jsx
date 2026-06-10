export default function InBodyLogo({ className = '', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg" className={className} fill={color}>
      <text x="0" y="30" fontFamily="Lato, Noto Sans, sans-serif" fontSize="30" fontWeight="900" letterSpacing="-1.5">
        InBody
      </text>
    </svg>
  );
}
