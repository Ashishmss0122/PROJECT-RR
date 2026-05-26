/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090d16',
        darkCard: 'rgba(15, 23, 42, 0.45)',
        cyanAccent: '#06b6d4',
        blueAccent: '#3b82f6',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
