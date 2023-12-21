/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00FF48',
        'primary-light': '#00FF48',
        secondary: '#222222',
        tertiary: '#111111',
        quaternary: '#333333',
        // background: 'hsl(var(--background))',
        // foreground: 'hsl(var(--foreground))',
        // btn: {
        //   background: 'hsl(var(--btn-background))',
        //   'background-hover': 'hsl(var(--btn-background-hover))',
        // },
      },
    },
  },
  plugins: [],
}
