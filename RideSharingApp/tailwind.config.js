/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './App.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#111111',
          dark: '#000000',
        },
        accent: {
          DEFAULT: '#F5C400',
          dark: '#D4A900',
          light: '#FFF5CC',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8F8F8',
          background: '#F5F5F5',
        },
        border: {
          DEFAULT: '#E5E5E5',
        },
        text: {
          primary: '#111111',
          secondary: '#555555',
          tertiary: '#888888',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#EA580C',
        },
        map: {
          DEFAULT: '#E8F0D8',
        },
      },
      borderRadius: {
        card: '12px',
        sheet: '16px',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
