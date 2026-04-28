/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          yellow: '#FFD700',
          dark: '#1A1A1A',
          gray: '#333333',
        }
      }
    },
  },
  plugins: [],
}
