/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      colors: {
        canvas: '#FAF6EE',
        evergreen: '#14281B',
        terracotta: {
          DEFAULT: '#C84C2C',
          dark: '#B33F20',
        },
        amber: '#E8A838',
        forest: '#244B36',
        linen: '#EDE6D6',
        sand: '#F7F1E5',
        wash: {
          muted: '#F4EDE0',
          forest: '#E7EFEA',
          amber: '#FDF6E7',
          terracotta: '#FAECE8',
        },
        mutedtext: '#8A8275',
        disabledbg: '#EAE3D2',
        kisan: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#2D7A2D',
          800: '#166534',
          900: '#14532d',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(20, 40, 27, 0.04), 0 4px 12px rgba(20, 40, 27, 0.03)',
        'card-hover': '0 4px 8px rgba(20, 40, 27, 0.06), 0 12px 24px rgba(20, 40, 27, 0.05)',
        modal: '0 12px 36px rgba(20, 40, 27, 0.12), 0 4px 12px rgba(20, 40, 27, 0.06)',
      },
      keyframes: {
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'amber-glow': {
          '0%': { boxShadow: '0 0 0 4px rgba(232, 168, 56, 0.22)' },
          '100%': { boxShadow: '0 0 0 4px rgba(232, 168, 56, 0)' },
        },
      },
      animation: {
        'page-in': 'page-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.8s infinite ease-in-out',
        'amber-glow': 'amber-glow 800ms ease-out',
      },
    },
  },
  plugins: [],
};