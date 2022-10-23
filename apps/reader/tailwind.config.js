/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{tsx,ts}', './node_modules/@literal-ui/core/**/*.js'],
  theme: {
    extend: {},
    container: {
      center: true,
      padding: '1rem',
    },
  },
  plugins: [require('@ink/tailwind'), require('@tailwindcss/line-clamp')],
}
