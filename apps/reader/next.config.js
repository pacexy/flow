const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const { withSentryConfig } = require('@sentry/nextjs')
const withPWA = require('next-pwa')
const withTM = require('next-transpile-modules')(['@ink/internal'])

const IS_DEV = process.env.NODE_ENV === 'development'

/**
 * @type {import('@sentry/nextjs').SentryWebpackPluginOptions}
 **/
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
const base = withPWA(
  withTM(
    withBundleAnalyzer({
      reactStrictMode: false,
      pageExtensions: ['ts', 'tsx'],
      pwa: {
        dest: 'public',
      },
    }),
  ),
)

const dev = base
const prod = withSentryConfig(
  base,
  // Make sure adding Sentry options is the last code to run before exporting, to
  // ensure that your source maps include changes from all other Webpack plugins
  sentryWebpackPluginOptions,
)

module.exports = IS_DEV ? dev : prod
