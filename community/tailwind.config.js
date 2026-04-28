/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#2F5D62', light: '#4A8187', dark: '#2E4A4F' },
        clay: { DEFAULT: '#B86B5E', light: '#D1897C' },
        sage: '#7E9C8C',
        linen: '#F4EFE8',
        surface: '#E7DDD1',
      }
    },
  },
  plugins: [],
}
