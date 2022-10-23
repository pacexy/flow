const KEY = 'rgba(0, 0, 0, 0.15)'
const AMBIENT = 'rgba(0, 0, 0, 0.3)'

exports.base = {
  '--md-sys-elevation-level1': `0px 1px 3px 1px ${KEY}, 0px 1px 2px ${AMBIENT};`,
  '--md-sys-elevation-level2': `0px 2px 6px 2px ${KEY}, 0px 1px 2px ${AMBIENT};`,
  '--md-sys-elevation-level3': `0px 4px 8px 3px ${KEY}, 0px 1px 3px ${AMBIENT};`,
  '--md-sys-elevation-level4': `0px 6px 10px 4px ${KEY}, 0px 2px 3px ${AMBIENT};`,
  '--md-sys-elevation-level5': `0px 8px 12px 6px ${KEY}, 0px 4px 4px ${AMBIENT};`,
}

exports.map = {
  1: 'var(--md-sys-elevation-level1)',
  2: 'var(--md-sys-elevation-level2)',
  3: 'var(--md-sys-elevation-level3)',
  4: 'var(--md-sys-elevation-level4)',
  5: 'var(--md-sys-elevation-level5)',
}
