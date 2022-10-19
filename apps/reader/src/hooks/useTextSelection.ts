// https://github.com/juliankrispel/use-text-selection

import { useEventListener } from '@literal-ui/hooks'
import { useState } from 'react'

import { useForceRender } from './useForceRender'

export function hasSelection(
  selection?: Selection | null,
): selection is Selection {
  return !(!selection || selection.isCollapsed)
}

// https://htmldom.dev/get-the-direction-of-the-text-selection/
export function isForwardSelection(selection: Selection) {
  if (selection.anchorNode && selection.focusNode) {
    const range = document.createRange()
    range.setStart(selection.anchorNode, selection.anchorOffset)
    range.setEnd(selection.focusNode, selection.focusOffset)

    return !range.collapsed
  }

  return true
}

export function useTextSelection(win?: Window) {
  const [selection, setSelection] = useState<Selection | undefined>()
  const render = useForceRender()

  useEventListener(win, 'mouseup', () => {
    const s = win?.getSelection()

    if (hasSelection(s)) {
      // sometime `getSelection` will return the same `selection`
      // when select text by clicking empty space
      render()
      setSelection(s)
    }
  })

  return [selection, setSelection] as const
}
