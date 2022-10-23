import {
  themeFromSourceColor,
  argbFromHex,
  redFromArgb,
  greenFromArgb,
  blueFromArgb,
} from '@material/material-color-utilities'
import Head from 'next/head'

import { useSettings } from '../state'

function generateCss(source = '#fff') {
  const theme = themeFromSourceColor(argbFromHex(source))

  const generateScheme = (schemeName: 'light' | 'dark') => {
    const scheme = theme.schemes[schemeName]
    let css = `color-scheme: ${schemeName};`
    Object.entries(scheme.toJSON()).forEach(([key, value]) => {
      const token = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

      css += `--md-sys-color-${token}:${[
        redFromArgb,
        greenFromArgb,
        blueFromArgb,
      ]
        .map((f) => f(value))
        .join(' ')};`
    })
    return css
  }

  return (
    `:root {${generateScheme('light')}}` +
    `:root.dark {${generateScheme('dark')}}`
  )
}

export function Theme() {
  const [{ theme }] = useSettings()
  return (
    <Head>
      <style
        id="theme"
        dangerouslySetInnerHTML={{ __html: generateCss(theme?.source) }}
      ></style>
    </Head>
  )
}
