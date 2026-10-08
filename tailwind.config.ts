import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        muted: {
          DEFAULT: '#707070',
          foreground: '#b0b0b0',
        },
        accent: {
          DEFAULT: '#F47521',
          foreground: '#000000',
        },
        card: {
          DEFAULT: '#141414',
          foreground: '#ffffff',
        },
        border: '#1a1a1a',
        ring: '#F47521',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        card: '8px',
      },
      spacing: {
        'hero-pad': '8vw',
      },
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shine: 'shine 0.75s ease-in-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
