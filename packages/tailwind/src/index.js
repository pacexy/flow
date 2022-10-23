const plugin = require('tailwindcss/plugin')

const colors = require('./colors')
const elevation = require('./elevation')
const state = require('./state')
const typography = require('./typography')

module.exports = plugin.withOptions(
  () => {
    return ({ addUtilities, addBase }) => {
      addBase({
        ':root': {
          ...typography.base,
          ...state.base,
          ...elevation.base,
        },
      })

      addUtilities({
        ...colors.utilities,
        ...typography.utilities,
      })
    }
  },
  function () {
    return {
      theme: {
        extend: {
          colors: colors.map,
          opacity: state.map,
          boxShadow: elevation.map,
        },
      },
    }
  },
)
