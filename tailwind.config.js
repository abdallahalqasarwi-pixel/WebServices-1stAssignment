/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          50: '#f7f8fa',
          100: '#eceff3',
          800: '#172033',
          900: '#0d1422',
          950: '#080d17',
        },
      },
      boxShadow: {
        soft: '0 18px 48px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
