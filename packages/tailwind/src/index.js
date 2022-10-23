const plugin = require('tailwindcss/plugin')

const colors = require('./colors')
const typography = require('./typography')
const state = require('./state')
const elevation = require('./elevation')

module.exports = plugin.withOptions(
  ({ source = '#6750a4' } = {}) => {
    return ({ addUtilities, addComponents, addBase, theme }) => {
      addBase({
        ':root': {
          ...colors.base(source),
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
  function (options) {
    return {
      theme: {
        extend: {
          colors: colors.map,
          opacity: state.map,
          boxShadow: elevation.map,
        },
      },
    }
  }
)
