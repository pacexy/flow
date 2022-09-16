const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withTM = require('next-transpile-modules')(['@ink/internal'])

/**
 * @type {import('rehype-pretty-code').Options}
 **/
const opts = {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
  onVisitLine(node) {
    // Prevent lines from collapsing in `display: grid` mode, and
    // allow empty lines to be copy/pasted
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }]
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className.push('highlighted')
  },
  onVisitHighlightedWord(node) {
    node.properties.className = ['word', 'highlighted']
  },
}

module.exports = withTM(
  withBundleAnalyzer({
    reactStrictMode: false,
    pageExtensions: ['ts', 'tsx', 'mdx'],
    pwa: {
      dest: 'public',
    },
    webpack: (config, options) => {
      config.module.rules.push({
        test: /.mdx?$/, // load both .md and .mdx files
        use: [
          options.defaultLoaders.babel,
          {
            loader: '@mdx-js/loader',
            options: {
              remarkPlugins: [],
              rehypePlugins: [[require('rehype-pretty-code'), opts]],
              // If you use `MDXProvider`, uncomment the following line.
              providerImportSource: '@mdx-js/react',
            },
          },
          './plugins/mdx',
        ],
      })

      return config
    },
  }),
)
