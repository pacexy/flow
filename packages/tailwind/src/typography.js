exports.base = {
  /** Display large */
  '--md-sys-typescale-display-large-family': 'Roboto',
  '--md-sys-typescale-display-large-line-height': '64px',
  '--md-sys-typescale-display-large-size': '57px',
  '--md-sys-typescale-display-large-tracking': '0',
  '--md-sys-typescale-display-large-weight': '400',

  /** Display medium */
  '--md-sys-typescale-display-medium-family': 'Roboto',
  '--md-sys-typescale-display-medium-line-height': '52px',
  '--md-sys-typescale-display-medium-size': '45px',
  '--md-sys-typescale-display-medium-tracking': '0',
  '--md-sys-typescale-display-medium-weight': '400',

  /** Display small */
  '--md-sys-typescale-display-small-family': 'Roboto',
  '--md-sys-typescale-display-small-line-height': '44px',
  '--md-sys-typescale-display-small-size': '36px',
  '--md-sys-typescale-display-small-tracking': '0',
  '--md-sys-typescale-display-small-weight': '400',

  /** Headline large */
  '--md-sys-typescale-headline-large-family': 'Roboto',
  '--md-sys-typescale-headline-large-line-height': '40px',
  '--md-sys-typescale-headline-large-size': '32px',
  '--md-sys-typescale-headline-large-tracking': '0',
  '--md-sys-typescale-headline-large-weight': '400',

  /** Headline medium */
  '--md-sys-typescale-headline-medium-family': 'Roboto',
  '--md-sys-typescale-headline-medium-line-height': '36px',
  '--md-sys-typescale-headline-medium-size': '28px',
  '--md-sys-typescale-headline-medium-tracking': '0',
  '--md-sys-typescale-headline-medium-weight': '400',

  /** Headline small */
  '--md-sys-typescale-headline-small-family': 'Roboto',
  '--md-sys-typescale-headline-small-line-height': '32px',
  '--md-sys-typescale-headline-small-size': '24px',
  '--md-sys-typescale-headline-small-tracking': '0',
  '--md-sys-typescale-headline-small-weight': '400',

  /** Title large */
  '--md-sys-typescale-title-large-family': 'Roboto',
  '--md-sys-typescale-title-large-line-height': '28px',
  '--md-sys-typescale-title-large-size': '22px',
  '--md-sys-typescale-title-large-tracking': '0',
  '--md-sys-typescale-title-large-weight': '400',

  /** Title medium */
  '--md-sys-typescale-title-medium-family': 'Roboto',
  '--md-sys-typescale-title-medium-line-height': '24px',
  '--md-sys-typescale-title-medium-size': '16px',
  '--md-sys-typescale-title-medium-tracking': '0.5px',
  '--md-sys-typescale-title-medium-weight': '500',

  /** Title small */
  '--md-sys-typescale-title-small-family': 'Roboto',
  '--md-sys-typescale-title-small-line-height': '20px',
  '--md-sys-typescale-title-small-size': '14px',
  '--md-sys-typescale-title-small-tracking': '0.1px',
  '--md-sys-typescale-title-small-weight': '500',

  /** Label large */
  '--md-sys-typescale-label-large-family': 'Roboto',
  '--md-sys-typescale-label-large-line-height': '20px',
  '--md-sys-typescale-label-large-size': '14px',
  '--md-sys-typescale-label-large-tracking': '0.1px',
  '--md-sys-typescale-label-large-weight': '500',

  /** Label medium */
  '--md-sys-typescale-label-medium-family': 'Roboto',
  '--md-sys-typescale-label-medium-line-height': '16px',
  '--md-sys-typescale-label-medium-size': '12px',
  '--md-sys-typescale-label-medium-tracking': '0.5px',
  '--md-sys-typescale-label-medium-weight': '500',

  /** Label small */
  '--md-sys-typescale-label-small-family': 'Roboto',
  '--md-sys-typescale-label-small-line-height': '16px',
  '--md-sys-typescale-label-small-size': '11px',
  '--md-sys-typescale-label-small-tracking': '0.5px',
  '--md-sys-typescale-label-small-weight': '500',

  /** Body large */
  '--md-sys-typescale-body-large-family': 'Roboto',
  '--md-sys-typescale-body-large-line-height': '24px',
  '--md-sys-typescale-body-large-size': '16px',
  '--md-sys-typescale-body-large-tracking': '0.5px',
  '--md-sys-typescale-body-large-weight': '400',

  /** Body medium */
  '--md-sys-typescale-body-medium-family': 'Roboto',
  '--md-sys-typescale-body-medium-line-height': '20px',
  '--md-sys-typescale-body-medium-size': '14px',
  '--md-sys-typescale-body-medium-tracking': '0.5px',
  '--md-sys-typescale-body-medium-weight': '400',

  /** Body small */
  '--md-sys-typescale-body-small-family': 'Roboto',
  '--md-sys-typescale-body-small-line-height': '16px',
  '--md-sys-typescale-body-small-size': '12px',
  '--md-sys-typescale-body-small-tracking': '0.4px',
  '--md-sys-typescale-body-small-weight': '400',
}

const roles = ['display', 'headline', 'title', 'label', 'body']
const levels = ['large', 'medium', 'small']

const utilities = {}

roles.forEach((role) => {
  levels.forEach((level) => {
    utilities[`.typescale-${role}-${level}`] = {
      fontFamily: `var(--md-sys-typescale-${role}-${level}-family)`,
      lineHeight: `var(--md-sys-typescale-${role}-${level}-line-height)`,
      fontSize: `var(--md-sys-typescale-${role}-${level}-size)`,
      letterSpacing: `var(--md-sys-typescale-${role}-${level}-tracking)`,
      fontWeight: `var(--md-sys-typescale-${role}-${level}-weight)`,
    }
  })
})

exports.utilities = utilities
