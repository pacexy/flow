import './styles.css'
import 'react-photo-view/dist/react-photo-view.css'

import { LiteralProvider } from '@literal-ui/core'
import { MDXProvider } from '@mdx-js/react'
import type { AppProps } from 'next/app'

import { H1, H2, Layout } from '../components'

const components = {
  h1: H1,
  h2: H2,
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LiteralProvider>
      <MDXProvider components={components}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </MDXProvider>
    </LiteralProvider>
  )
}
