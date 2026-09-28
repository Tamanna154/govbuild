/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f4f9',
          100: '#e1e9f3',
          200: '#c3d3e7',
          300: '#94b3d7',
          400: '#5e8ec3',
          500: '#3a70ad',
          600: '#2a5792',
          700: '#234676',
          800: '#1e3c63',
          900: '#1a3352',
          950: '#0e1f35',
        },
      },
    },
  },
  plugins: [],
}
