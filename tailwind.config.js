/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FA6978',
          50: '#FEF2F3',
          100: '#FDE6E8',
          200: '#FBD0D5',
          300: '#F8A8B1',
          400: '#F57A88',
          500: '#FA6978',
          600: '#E83F51',
          700: '#D32D3F',
          800: '#B12437',
          900: '#942233',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
