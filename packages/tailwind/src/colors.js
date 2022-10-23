function makeColorString(variable, opacity) {
  if (opacity === undefined) {
    return `rgb(var(${variable}))`
  }
  return `rgb(var(${variable}) / ${opacity})`
}

function withOpacity(variable, opacityPreset) {
  return ({ opacityValue }) => {
    const opacity = opacityPreset || opacityValue
    return makeColorString(variable, opacity)
  }
}

function makeLinearGradient(color) {
  return `linear-gradient(${color},${color})`
}

const names = [
  'primary',
  'on-primary',
  'primary-container',
  'on-primary-container',
  'secondary',
  'on-secondary',
  'secondary-container',
  'on-secondary-container',
  'tertiary',
  'on-tertiary',
  'tertiary-container',
  'on-tertiary-container',
  'error',
  'on-error',
  'error-container',
  'on-error-container',
  'background',
  'on-background',
  'surface',
  'on-surface',
  'surface-variant',
  'on-surface-variant',
  'outline',
  'shadow',
  'inverse-surface',
  'inverse-on-surface',
  'inverse-primary',
]

exports.map = names.reduce(
  (acc, name) => {
    acc[name] = withOpacity(`--md-sys-color-${name}`)
    return acc
  },
  {
    // Derived colors
    disabled: makeColorString('--md-sys-color-on-surface', 0.12),
    'on-disabled': makeColorString('--md-sys-color-on-surface', 0.38),
  },
)

const utilities = {}

const surfaceMap = {
  1: 0.05,
  2: 0.08,
  3: 0.11,
  4: 0.12,
  5: 0.14,
}

Object.entries(surfaceMap).forEach(([level, opacity]) => {
  utilities[`.bg-surface${level}`] = {
    backgroundImage: makeLinearGradient(
      makeColorString(`--md-sys-color-primary`, opacity),
    ),
    backgroundColor: makeColorString('--md-sys-color-surface'),
  }
})

exports.utilities = utilities
