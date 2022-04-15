import './styles.css'

import { LiteralProvider } from '@literal-ui/core'
import { MDXProvider } from '@mdx-js/react'
import type { MDXComponents } from 'mdx/types'
import type { AppProps } from 'next/app'
import { RecoilRoot } from 'recoil'

import { H1, H2, Layout } from '../components'

const components: MDXComponents = {
  h1: H1,
  h2: H2,
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LiteralProvider>
      <MDXProvider components={components}>
        <RecoilRoot>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </RecoilRoot>
      </MDXProvider>
    </LiteralProvider>
  )
}
