module.exports = {
  extends: ['../../.eslintrc.js', 'next'],
  settings: {
    next: {
      rootDir: 'apps/next',
    },
  },
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',
  },
}
