import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#1e354d',
          dark: '#11202f',
          light: '#dbe4eb',
        },
        cream: {
          50: '#fdfcf9',
          100: '#fcfaf6',
          200: '#f7f4ed',
          300: '#ded4c0',
        },
        gold: {
          500: '#f59e0b',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
