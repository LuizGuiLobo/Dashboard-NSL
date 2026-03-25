/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0c10',
          surface: '#111419',
          surface2: '#191d24',
          border: '#252a33',
          muted: '#6b7280',
        },
        accent: {
          DEFAULT: '#f59e0b',
          hover: '#d97706',
        },
        setor: {
          bombaInjetora: '#3b82f6',
          bombaAlta: '#f59e0b',
          injetoresMec: '#10b981',
          injetoresEle: '#8b5cf6',
          veiculoDiesel: '#ef4444',
          turbinas: '#06b6d4',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
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
