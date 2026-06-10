/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // InBody Brand Colors (oficiales del brandbook v1.0.1)
        'inbody-red': {
          DEFAULT: '#971B2F',     // InBody Red oficial - PANTONE 7427C
          hover: '#7d1626',       // 15% más oscuro para hover
          dark: '#6e1421',        // Para texto sobre fondos claros
          soft: '#f9eaec',        // Tinte muy claro para fondos
          50: '#fdf3f4',
          100: '#fbe7ea',
          200: '#f5c5cc',
          300: '#eb96a4',
          400: '#dc6a7e',
          500: '#971B2F',
          600: '#7d1626',
          700: '#651120',
          800: '#530f1c',
          900: '#451018',
        },
        // Pin del mapa: rojo brillante (como pidieron - puede quedarse)
        'pin-red': '#E31937',
        // InBody Grays (oficiales)
        'inbody-gray': {
          light: '#B2B4B8',       // Light Gray - PANTONE 429C
          cool: '#67767F',        // Cool Gray - PANTONE 430C
          dark: '#4B4F5A',        // Dark Gray - PANTONE 431C
          black: '#101820',       // InBody Black - PANTONE 6C
          ice: '#A2B2C8',         // Ice Gray (motif graphic)
        },
        // Mantener neutral aliasing para minimizar cambios en componentes
        neutral: {
          50: '#fafaf7',
          100: '#f5f4f0',
          150: '#ececea',
          200: '#dedddb',
          300: '#B2B4B8',         // mapped to InBody Light Gray
          400: '#8a8a8f',
          500: '#67767F',         // mapped to InBody Cool Gray
          600: '#5c5c60',
          700: '#4B4F5A',         // mapped to InBody Dark Gray
          800: '#2c2d33',
          900: '#101820',         // mapped to InBody Black
        },
      },
      fontFamily: {
        // Tipografías oficiales InBody (brandbook v1.0.1)
        // Primary: Noto Sans (body) + Lato (display)
        sans: ['"Noto Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Lato', '"Noto Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
