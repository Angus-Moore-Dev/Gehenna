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
        primary: '#E67700',
        'primary-light': '#F08C00',
        secondary: '#222222',
        tertiary: '#111111',
        quaternary: '#333333',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')({
      className: 'text-zinc-100 font-medium'
    }),
  ],
}