const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const { withSentryConfig } = require('@sentry/nextjs')
const withPWA = require('next-pwa')
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

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withSentryConfig(
  withPWA(
    withTM(
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
    ),
  ),
  // Make sure adding Sentry options is the last code to run before exporting, to
  // ensure that your source maps include changes from all other Webpack plugins
  sentryWebpackPluginOptions,
)
