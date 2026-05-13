/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        inbody: {
          red: '#E31937',
          'red-dark': '#a32d2d',
          'red-soft': '#fce4e8',
          'red-hover': '#c41530',
        },
        neutral: {
          50: '#fafaf7',
          100: '#f4f3ee',
          150: '#ececea',
          200: '#e8e8e3',
          900: '#18181a',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
