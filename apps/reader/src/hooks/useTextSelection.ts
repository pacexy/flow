// https://github.com/juliankrispel/use-text-selection

import { useIsomorphicEffect } from '@literal-ui/hooks'
import { useState } from 'react'

type ClientRect = Record<keyof Omit<DOMRect, 'toJSON'>, number>

type TextSelectionState = {
  selection?: Selection
  rect?: ClientRect
  isCollapsed?: boolean
  textContent?: string
}

const defaultState: TextSelectionState = {}

export function hasSelection(
  selection?: Selection | null,
): selection is Selection {
  return !(!selection || selection.isCollapsed)
}

/**
 * useTextSelection(ref)
 *
 * @description
 * hook to get information about the current text selection
 *
 */
export function useTextSelection(win?: Window) {
  const [state, setState] = useState(defaultState)

  useIsomorphicEffect(() => {
    function handler() {
      setState(() => {
        const selection = win?.getSelection()
        const newState: TextSelectionState = {}

        if (!hasSelection(selection)) {
          return newState
        }

        const range = selection.getRangeAt(0)

        const contents = range.cloneContents()
        if (contents.textContent !== null) {
          newState.textContent = contents.textContent
        }

        const [rect] = [...range.getClientRects()].filter((r) => r.width)
        if (rect) newState.rect = rect

        newState.selection = selection
        newState.isCollapsed = range.collapsed

        return newState
      })
    }

    win?.document.addEventListener('selectionchange', handler)
    win?.document.addEventListener('keydown', handler)
    win?.document.addEventListener('keyup', handler)
    win?.addEventListener('resize', handler)

    return () => {
      win?.document.removeEventListener('selectionchange', handler)
      win?.document.removeEventListener('keydown', handler)
      win?.document.removeEventListener('keyup', handler)
      win?.removeEventListener('resize', handler)
    }
  }, [win])

  return state
}
