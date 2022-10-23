import {
  themeFromSourceColor,
  argbFromHex,
  redFromArgb,
  greenFromArgb,
  blueFromArgb,
} from '@material/material-color-utilities'
import Head from 'next/head'

import { useSettings } from '../state'

// let `tailwindcss` generate classes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const classNamesToGenerate = [
  'bg-surface',
  'bg-surface1',
  'bg-surface2',
  'bg-surface3',
  'bg-surface4',
  'bg-surface5',
  'hover:bg-surface',
  'hover:bg-surface1',
  'hover:bg-surface2',
  'hover:bg-surface3',
  'hover:bg-surface4',
  'hover:bg-surface5',
]

function generateCss(source = '#fff') {
  const theme = themeFromSourceColor(argbFromHex(source))

  const generateScheme = (schemeName: 'light' | 'dark') => {
    const scheme = theme.schemes[schemeName]
    let css = `color-scheme: ${schemeName};`
    Object.entries(scheme.toJSON()).forEach(([key, value]) => {
      const token = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
      const color = [redFromArgb, greenFromArgb, blueFromArgb]
        .map((f) => f(value))
        .join(' ')
      css += `--md-sys-color-${token}:${color};`
    })
    return css
  }

  return (
    `:root, .light {${generateScheme('light')}}` +
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
