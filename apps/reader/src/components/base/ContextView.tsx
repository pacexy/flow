// https://github.com/microsoft/vscode/blob/36fdf6b697cba431beb6e391b5a8c5f3606975a1/src/vs/base/browser/ui/contextview/contextview.ts

export const enum LayoutAnchorPosition {
  Before,
  After,
}

export enum LayoutAnchorMode {
  AVOID,
  ALIGN,
}

interface ILayoutAnchor {
  offset: number
  size: number
  mode?: LayoutAnchorMode
  /** preferred anchor position */
  position: LayoutAnchorPosition
}

/**
 * {@link ./ContextView.excalidraw}
 *
 * Lays out a one dimensional view next to an anchor in a viewport.
 *
 * @returns The view offset within the viewport.
 */
export function layout(
  viewportSize: number,
  viewSize: number,
  anchor: ILayoutAnchor,
) {
  const layoutAfterAnchorBoundary =
    anchor.mode === LayoutAnchorMode.ALIGN
      ? anchor.offset
      : anchor.offset + anchor.size
  const layoutBeforeAnchorBoundary =
    anchor.mode === LayoutAnchorMode.ALIGN
      ? anchor.offset + anchor.size
      : anchor.offset

  if (anchor.position === LayoutAnchorPosition.Before) {
    if (viewSize <= viewportSize - layoutAfterAnchorBoundary) {
      return layoutAfterAnchorBoundary // happy case, lay it out after the anchor
    }

    if (viewSize <= layoutBeforeAnchorBoundary) {
      return layoutBeforeAnchorBoundary - viewSize // ok case, lay it out before the anchor
    }

    return Math.max(viewportSize - viewSize, 0) // sad case, lay it over the anchor
  } else {
    if (viewSize <= layoutBeforeAnchorBoundary) {
      return layoutBeforeAnchorBoundary - viewSize // happy case, lay it out before the anchor
    }

    if (viewSize <= viewportSize - layoutAfterAnchorBoundary) {
      return layoutAfterAnchorBoundary // ok case, lay it out after the anchor
    }

    return 0 // sad case, lay it over the anchor
  }
}
