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
  Custom = 'custom-theme',
}

export function updateCustomStyle(
  document: Document | undefined,
  settings?: Settings,
) {
  if (!document) return

  let el = document.getElementById(Style.Custom)
  if (!el) {
    el = document.createElement('style')
    el.id = Style.Custom
    document.head.appendChild(el)
  }

  if (settings) {
    el.innerHTML = `
      a, article, cite, div, li, p, pre, span, table, body {
        ${mapToCss(settings)}
      }
    `
  }
}
