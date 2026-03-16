import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f7fb',
          100: '#ebeef6',
          200: '#d8dfeb',
          300: '#b2c0d5',
          400: '#7f93b3',
          500: '#5c7193',
          600: '#435775',
          700: '#314158',
          800: '#222d40',
          900: '#161e2e',
        },
        brand: {
          50: '#eef7ff',
          100: '#d8ebff',
          200: '#b6d8ff',
          300: '#7bbcff',
          400: '#419cf4',
          500: '#1f7ae0',
          600: '#175fc0',
          700: '#164c98',
          800: '#193f78',
          900: '#1a355f',
        },
        accent: {
          500: '#1db79a',
          600: '#159276',
        },
      },
      boxShadow: {
        glow: '0 18px 40px rgba(31, 122, 224, 0.2)',
        card: '0 20px 80px rgba(15, 23, 42, 0.08)',
        panel: '0 10px 30px rgba(15, 23, 42, 0.06)',
        insetSoft: 'inset 0 1px 0 rgba(255,255,255,0.55)',
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top left, rgba(31,122,224,0.18), transparent 30%), radial-gradient(circle at top right, rgba(29,183,154,0.12), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.96), rgba(241,247,255,0.93) 45%, rgba(236,244,251,0.96))',
        'hero-dark': 'radial-gradient(circle at top left, rgba(31,122,224,0.22), transparent 30%), radial-gradient(circle at top right, rgba(29,183,154,0.12), transparent 24%), linear-gradient(135deg, rgba(8,15,28,0.98), rgba(15,23,42,0.96) 52%, rgba(17,24,39,0.98))',
        mesh: 'radial-gradient(circle at 20% 20%, rgba(31,122,224,0.1), transparent 0 32%), radial-gradient(circle at 80% 10%, rgba(29,183,154,0.08), transparent 0 24%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.06), transparent 0 30%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        pulseSoft: 'pulseSoft 1.8s ease-in-out infinite',
        rise: 'rise 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
