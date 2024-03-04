import { useCallback, useRef } from 'react'
import { useEventListener } from '@literal-ui/hooks'
import {hasSelection} from './useTextSelection'
import {AsRef, BookTab} from '../models/reader'

export function useTouchEvent(props: {iframe?: Window & AsRef; tab: BookTab}) {
  const {iframe, tab} = props;
  const params = useRef({x: -1, y: -1, t: 0, expired: false})

  const handleTouchEnd = useCallback(function(e: TouchEvent) {
    if (!iframe) return
    iframe.ontouchend = undefined
    console.log('params:', params.current)
    const selection = iframe.getSelection()
    
    if (hasSelection(selection)) return
    if (params.current.expired) return

    params.current.expired = true

    const x1 = e.changedTouches[0]?.clientX ?? 0
    const y1 = e.changedTouches[0]?.clientY ?? 0
    const t1 = Date.now()

    const {x, y, t} = params.current;

    const deltaX = x1 - x
    const deltaY = y1 - y
    const deltaT = t1 - t

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX < 10) return

    if (absY / absX > 2) {
      if (deltaT > 100 || absX < 30) {
        return
      }
    }

    if (deltaX > 0) {
      tab.prev()
    }

    if (deltaX < 0) {
      tab.next()
    }
  }, [tab, iframe]);


  useEventListener(iframe, 'touchstart', (e) => {
    const x0 = e.targetTouches[0]?.clientX ?? 0
    const y0 = e.targetTouches[0]?.clientY ?? 0
    const t0 = Date.now()

    params.current = {x: x0, y: y0, t: t0, expired: false}

    // When selecting text with long tap, `touchend` is not fired,
    // so instead of use `addEventlistener`, we should use `on*`
    // to remove the previous listener.
    if (!iframe) return
    iframe.ontouchend = handleTouchEnd
  });

  useEventListener(iframe, 'touchend', handleTouchEnd)
}
