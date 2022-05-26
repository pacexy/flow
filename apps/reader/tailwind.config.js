module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{tsx,ts}', './node_modules/@literal-ui/core/**/*.js'],
  theme: {
    extend: {},
    container: {
      center: true,
    },
  },
  plugins: [
    require('m3-tokens/tailwind')({ source: '#808080' }),
    require('@literal-ui/plugins'),
    require('@tailwindcss/line-clamp'),
  ],
}
