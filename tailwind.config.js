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
      fontSize: {
        xxs: '0.675rem',
      },
      spacing: {
        '94': '22rem',
      },
    },
  },
  plugins: [],
}
