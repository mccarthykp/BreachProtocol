/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        rajdhani: ['Rajdhani'],
        orbitron: ['Orbitron'],
      },
      textUnderlineOffset: {
        9: '9px',
        10: '10px',
        11: '11px',
        12: '12px',
      },
    },
  },
  plugins: [],
}

