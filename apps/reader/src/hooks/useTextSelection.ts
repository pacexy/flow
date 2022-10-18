// https://github.com/juliankrispel/use-text-selection

import { useIsomorphicEffect } from '@literal-ui/hooks'
import { useState } from 'react'

type TextSelectionState = {
  selection?: Selection
  range?: Range
  rects?: DOMRect[]
  isCollapsed?: boolean
  textContent?: string
  forward?: boolean
}

const defaultState: TextSelectionState = {}

export function hasSelection(
  selection?: Selection | null,
): selection is Selection {
  return !(!selection || selection.isCollapsed)
}

// https://htmldom.dev/get-the-direction-of-the-text-selection/
function isForwardSelection(selection: Selection) {
  if (selection.anchorNode && selection.focusNode) {
    const range = document.createRange()
    range.setStart(selection.anchorNode, selection.anchorOffset)
    range.setEnd(selection.focusNode, selection.focusOffset)

    return !range.collapsed
  }
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
          newState.textContent = contents.textContent.trim()
        }

        const forward = isForwardSelection(selection)

        const rects = [...range.getClientRects()].filter((r) => r.width)

        newState.range = range
        newState.rects = rects
        newState.forward = forward
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
