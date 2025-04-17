/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF5252', // Bright red accent (teenage engineering inspired)
        secondary: '#4285F4', // Google blue
        tertiary: '#FBBC05', // Google yellow
        neutral: {
          50: '#F8F9FA',  // Google light gray
          100: '#F1F3F4',
          200: '#E8EAED',
          300: '#DADCE0',
          400: '#BDC1C6',
          500: '#9AA0A6', // Google mid gray
          600: '#80868B',
          700: '#5F6368', // Google dark gray
          800: '#3C4043',
          900: '#202124', // Google near black
        },
        'te-orange': '#FF5722', // Teenage engineering orange
        'te-yellow': '#FFEB3B', // Teenage engineering yellow
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        display: ['Archivo', 'sans-serif']
      },
      borderRadius: {
        'sm': '2px',
        DEFAULT: '3px',
        'md': '4px',
        'lg': '8px',
      },
      boxShadow: {
        'retro': '2px 2px 0 rgba(0, 0, 0, 0.1)',
        'button': '0 1px 2px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
} 