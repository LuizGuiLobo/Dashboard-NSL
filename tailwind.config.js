/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          surface2: 'var(--color-surface2)',
          surface3: 'var(--color-surface3)',
          border: 'var(--color-border)',
          muted: 'var(--color-muted)',
        },
        // Design system Nova São Luiz Diesel
        primary: {
          DEFAULT: 'rgb(var(--primary-rgb) / <alpha-value>)',
          container: '#1b2a8c',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          hover: '#27903f',
          fixed: '#bfe8c9',
        },
        onsurface: 'var(--color-onsurface)',
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
        display: ['"Outfit"', '"Century Gothic"', 'system-ui', 'sans-serif'],
        body: ['"Outfit"', '"Century Gothic"', 'system-ui', 'sans-serif'],
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
