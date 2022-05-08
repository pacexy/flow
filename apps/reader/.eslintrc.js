module.exports = {
  extends: ['../../.eslintrc.js', 'next'],
  settings: {
    next: {
      rootDir: 'apps/reader',
    },
  },
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    '@next/next/no-img-element': 'off',
    'react/jsx-key': 'off',
    'react/no-children-prop': 'off',
  },
}
