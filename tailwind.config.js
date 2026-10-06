/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: Burgundy Red (#7F1D1D) — the core Sam Campus Slot brand color.
        // Used for primary buttons, active navigation, important accents, selected states.
        brand: {
          50: '#FBEFEF',
          100: '#F5D9D9',
          200: '#E8B0B0',
          300: '#D68080',
          400: '#B94F4F',
          500: '#7F1D1D',
          600: '#6B1818',
          700: '#571313',
          800: '#430F0F',
          900: '#350C0C',
        },
        // Secondary "smart" accent — a warmer, lighter peach tone used for smart-classroom
        // badges and highlight moments, distinct in weight from the `slot` accent.
        teal: {
          50: '#FFF6EA',
          100: '#FEE9CE',
          200: '#FCD6A5',
          300: '#F9BC72',
          400: '#F4A261',
          500: '#EC8A3D',
          600: '#D06E24',
          700: '#A6551D',
          800: '#7D4118',
          900: '#5F3213',
        },
        // Deep Burgundy (#3B0D11) — reserved for the cover/hero, navbar/sidebar and
        // other rich, dark brand surfaces (dark-mode base).
        forest: {
          50: '#F7EBEC',
          100: '#E9CCCF',
          200: '#D2999F',
          400: '#7A2530',
          600: '#4D141B',
          700: '#3B0D11',
          800: '#2E0A0D',
          900: '#22080A',
          950: '#170506',
        },
        // Accent: Peach (#F4A261) — highlights, hover states, smart recommendations, icons.
        slot: {
          50: '#FFF7ED',
          100: '#FEE9D6',
          200: '#FDD3AD',
          300: '#FBB97D',
          400: '#F4A261',
          500: '#EE8A3B',
          600: '#DB6E22',
          700: '#B4571C',
          800: '#8F4419',
          900: '#703616',
        },
        // Neutral scale for text/surfaces, warm-cream based (#FFF7ED light end,
        // deep burgundy #3B0D11 dark end) rather than the previous green-tinted grays.
        ink: {
          50: '#FFFCF8',
          100: '#FFF7ED',
          200: '#F3E3D3',
          300: '#E2C6A9',
          400: '#C29E79',
          500: '#9C7A5C',
          600: '#6E5342',
          700: '#4A362B',
          800: '#3B0D11',
          900: '#2A0A0D',
          950: '#1C0708',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(59,13,17,0.10), 0 8px 24px -8px rgba(59,13,17,0.14)',
        glow: '0 0 0 1px rgba(127,29,29,0.18), 0 12px 32px -8px rgba(127,29,29,0.35)',
      },
      backgroundImage: {
        'slot-grid': 'linear-gradient(rgba(127,29,29,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(127,29,29,0.06) 1px, transparent 1px)',
      },
      animation: {
        'fade-up': 'fadeUp .6s ease forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2.8s ease-in-out infinite',
        'dash': 'dash 2.4s linear infinite',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        glowPulse: { '0%,100%': { opacity: 0.55 }, '50%': { opacity: 1 } },
        dash: { to: { strokeDashoffset: -24 } },
      },
    },
  },
  plugins: [],
}
