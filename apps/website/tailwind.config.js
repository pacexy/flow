/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{tsx,ts}', './node_modules/@literal-ui/core/**/*.js'],
  theme: {
    extend: {},
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1024px',
      },
    },
  },
  plugins: [
    require('m3-tokens/tailwind')({ source: '#808080' }),
    require('@literal-ui/plugins'),
    require('@tailwindcss/line-clamp'),
  ],
}
