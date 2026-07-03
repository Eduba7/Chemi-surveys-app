/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'csmc-blue': '#1034A6',
        'csmc-neon': '#39FF14',
        'csmc-lemon': '#DFFF00',
      },
      fontSize: {
        '2xs': '0.65rem',
      },
    },
  },
  plugins: [],
};
