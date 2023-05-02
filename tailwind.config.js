/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFAA00',
        secondary: '#272727',
        tertiary: '#1f1f1f',
        quaternary: '#333333',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}