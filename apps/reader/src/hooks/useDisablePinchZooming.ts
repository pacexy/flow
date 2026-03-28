import { useEffect } from 'react'

// https://github.com/excalidraw/excalidraw/blob/7eaf47c9d41a33a6230d8c3a16b5087fc720dcfb/src/packages/excalidraw/index.tsx#L66
export function useDisablePinchZooming(win?: Window) {
  useEffect(() => {
    const _win = win ?? window
    // Block pinch-zooming on iOS outside of the content area
    const handleTouchMove = (event: TouchEvent) => {
      // event.preventDefault()
      if ((event as any).scale !== 1) {
        event.preventDefault()
      }
    }

    _win.document.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    })

    return () => {
      _win.document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [win])
}
