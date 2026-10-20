/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f8',
          100: '#fbe8f2',
          200: '#f7d2e5',
          300: '#f0adcf',
          400: '#e577ab',
          500: '#d94b8b',
          600: '#c52d6f',
          700: '#a61f57',
          800: '#8a1c49',
          900: '#731c40',
          950: '#460b22',
        },
        royal: {
          50: '#f4f5fc',
          100: '#e8eaf7',
          200: '#d6d9f1',
          300: '#b7bde7',
          400: '#929ad9',
          500: '#7378cb',
          600: '#5c5ebc',
          700: '#4e4ea5',
          800: '#424287',
          900: '#39396d',
          950: '#232344',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
