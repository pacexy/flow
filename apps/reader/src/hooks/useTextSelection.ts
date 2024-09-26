// https://github.com/juliankrispel/use-text-selection

import { useEventListener } from '@literal-ui/hooks'
import { useState } from 'react'

import { isTouchScreen } from '../platform'

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

  const isAndroid = navigator.userAgent.toLowerCase().indexOf('android') > -1

  // On touch screen device, mouse/touch/pointer events not working when selection is created.
  useEventListener(
    isTouchScreen ? win?.document : win,
    isTouchScreen
      ? isAndroid
        ? 'selectionchange'
        : 'touchend'
      : 'mouseup',
    () => {
      const s = win?.getSelection()

      if (hasSelection(s)) {
        // sometime `getSelection` will return the same `selection`
        // when select text by clicking empty space
        render()
        setSelection(s)
      }
    },
  )

  // https://stackoverflow.com/questions/3413683/disabling-the-context-menu-on-long-taps-on-android
  useEventListener(win, 'contextmenu', (e) => {
    if (isTouchScreen) {
      e.preventDefault()
    }
  })

  return [selection, setSelection] as const
}
