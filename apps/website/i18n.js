const localeMap = {
  'en-US': 'English',
  'zh-CN': '简体中文',
  'ja-JP': '日本語',
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
