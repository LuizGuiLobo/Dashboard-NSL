/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#131313',
          surface: '#1B1B1B',
          surface2: '#2A2A2A',
          surface3: '#353535',
          border: '#44464F',
          muted: '#737373',
        },
        primary: {
          DEFAULT: '#B3C5FE',
          container: '#405284',
        },
        accent: {
          DEFAULT: '#FFBA46',
          hover: '#D08E00',
          fixed: '#FFDDB0',
        },
        onsurface: '#E5E2E1',
        setor: {
          bombaInjetora: '#3b82f6',
          bombaAlta: '#FFBA46',
          injetoresMec: '#10b981',
          injetoresEle: '#8b5cf6',
          veiculoDiesel: '#ef4444',
          turbinas: '#06b6d4',
        },
      },
      fontFamily: {
        display: ['"Manrope"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        slideUp: 'slideUp 0.3s ease-out',
        fadeIn: 'fadeIn 0.2s ease-out',
        countUp: 'countUp 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
