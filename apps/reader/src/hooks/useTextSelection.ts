// https://github.com/juliankrispel/use-text-selection

import { useIsomorphicEffect } from '@literal-ui/hooks'
import { useCallback, useState } from 'react'

type ClientRect = Record<keyof Omit<DOMRect, 'toJSON'>, number>

function roundValues(_rect: ClientRect) {
  const rect = {
    ..._rect,
  }
  for (const key of Object.keys(rect)) {
    // @ts-ignore
    rect[key] = Math.round(rect[key])
  }
  return rect
}

function shallowDiff(prev: any, next: any) {
  if (prev != null && next != null) {
    for (const key of Object.keys(next)) {
      if (prev[key] != next[key]) {
        return true
      }
    }
  } else if (prev != next) {
    return true
  }
  return false
}

type TextSelectionState = {
  rect?: ClientRect
  isCollapsed?: boolean
  textContent?: string
}

const defaultState: TextSelectionState = {}

/**
 * useTextSelection(ref)
 *
 * @description
 * hook to get information about the current text selection
 *
 */
export function useTextSelection(win?: Window) {
  const [{ rect, isCollapsed, textContent }, setState] = useState(defaultState)

  const handler = useCallback(() => {
    let newRect: ClientRect
    const selection = win?.getSelection()
    let newState: TextSelectionState = {}

    if (selection == null || selection.isCollapsed) {
      setState(newState)
      return
    }

    const range = selection.getRangeAt(0)

    if (range == null) {
      setState(newState)
      return
    }

    const contents = range.cloneContents()

    if (contents.textContent != null) {
      newState.textContent = contents.textContent
    }

    const rects = [...range.getClientRects()].filter((r) => r.width)

    if (rects.length === 0 && range.commonAncestorContainer != null) {
      const el = range.commonAncestorContainer as HTMLElement
      newRect = roundValues(el.getBoundingClientRect().toJSON())
    } else {
      if (!rects[0]) return
      newRect = roundValues(rects[0].toJSON())
    }
    if (shallowDiff(rect, newRect)) {
      newState.rect = newRect
    }
    newState.isCollapsed = range.collapsed

    setState(newState)
  }, [rect, win])

  useIsomorphicEffect(() => {
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

  return {
    rect,
    isCollapsed,
    textContent,
  }
}
