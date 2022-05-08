import { PreventFlash } from '@literal-ui/core'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/icons/192.png"></link>
        <title>reReader</title>
        <PWA />
      </Head>
      <body>
        <Main />
        <NextScript />
        <PreventFlash />
      </body>
    </Html>
  )
}

function PWA() {
  return (
    <>
      <link rel="manifest" href="/manifest.json" />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: light)"
        content="white"
      />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: dark)"
        content="black"
      />
      <link rel="apple-touch-icon" href="/icons/192.png" />
    </>
  )
}
