import { Contents } from 'epubjs'
import { CSSProperties } from 'react'

import { Settings } from './state'
import { keys } from './utils'

const camelToSnake = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

function mapToCss(o: CSSProperties) {
  return keys(o)
    .filter((k) => o[k] !== undefined)
    .map((k) => `${camelToSnake(k)}: ${o[k]} !important;`)
    .join('\n')
}

enum Style {
  Custom = 'custom',
}

export function updateCustomStyle(
  contents: Contents | undefined,
  settings: Settings | undefined,
) {
  if (!contents || !settings) return

  contents.addStylesheetCss(
    `a, article, cite, div, li, p, pre, span, table, body {
        ${mapToCss(settings)}
    }`,
    Style.Custom,
  )
}
