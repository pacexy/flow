const localeMap = {
  'en-US': 'English',
  'vi-VN': '简体中文',
}

const locales = Object.keys(localeMap)

module.exports = {
  localeMap,
  locales,
  defaultLocale: locales[0],
  defaultNS: 'common',
  pages: {
    '*': ['common'],
  },
  loadLocaleFrom: (lang) =>
    // You can use a dynamic import, fetch, whatever. You should
    // return a Promise with the JSON file.
    import(`./locales/${lang}.json`).then((m) => m.default),
}
