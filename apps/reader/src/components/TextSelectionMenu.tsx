import { Overlay } from '@literal-ui/core'
import { useEventListener } from '@literal-ui/hooks'
import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import { MdOutlineAddBox, MdOutlineEdit, MdSearch } from 'react-icons/md'
import { useSetRecoilState } from 'recoil'
import { useSnapshot } from 'valtio'

import { useMobile, useTextSelection } from '../hooks'
import { BookTab } from '../models'
import { actionState } from '../state'
import { keys, last } from '../utils'

import { IconButton } from './Button'
import { reader } from './Reader'

const typeMap = {
  highlight: {
    style: 'backgroundColor',
    class: 'rounded',
  },
  // underline: {
  //   style: 'border-bottom-color',
  //   class: 'border-b-2',
  // },
}

// "dark color + low opacity" is clearer than "light color + high opacity"
// from tailwind [color]-600
const colorMap = {
  yellow: 'rgba(217, 119, 6, 0.2)',
  red: 'rgba(220, 38, 38, 0.2)',
  green: 'rgba(22, 163, 74, 0.2)',
  blue: 'rgba(37, 99, 235, 0.2)',
}

interface TextSelectionMenuProps {
  tab: BookTab
}
export const TextSelectionMenu: React.FC<TextSelectionMenuProps> = ({
  tab,
}) => {
  const setAction = useSetRecoilState(actionState)
  const { rendition } = useSnapshot(tab)
  const [display, setDisplay] = useState(false)
  const mobile = useMobile()

  // `manager` is not reactive, so we need to use getter
  const view = useCallback(() => {
    return rendition?.manager?.views._views[0]
  }, [rendition])

  const win = view()?.window

  const { selection, range, rects, forward, textContent } =
    useTextSelection(win)
  const rect = rects && (forward ? last(rects) : rects[0])

  const [offsetLeft, setOffsetLeft] = useState(0)

  const handler = useCallback(() => {
    const el = view()?.element as HTMLElement
    if (!el) return

    const containerLeft = el.parentElement!.getBoundingClientRect().left
    const viewLeft = el.getBoundingClientRect().left
    setOffsetLeft(viewLeft - containerLeft)
  }, [view])

  useEffect(() => {
    rendition?.on('relocated', handler)
  }, [handler, rendition])

  useEffect(() => {
    setDisplay(false)
  }, [selection])

  useEventListener(win, 'mouseup', () => setDisplay(true))

  if (!display || !range || !rect || !textContent) return null

  return (
    <>
      <div
        className={clsx(
          'bg-surface text-on-surface-variant shadow-1 absolute z-20 -translate-x-1/2 p-1',
          !forward && '-translate-y-full',
        )}
        style={
          forward
            ? {
                top: rect.bottom,
                left: rect.right + offsetLeft,
              }
            : {
                top: rect.top,
                left: rect.left + offsetLeft,
              }
        }
      >
        <div className="flex gap-1">
          <IconButton
            title="Search in book"
            Icon={MdSearch}
            size={20}
            onClick={() => {
              selection?.removeAllRanges()
              setAction('Search')
              reader.focusedBookTab?.setKeyword(textContent)
            }}
          />
          <IconButton
            title="Annotate"
            Icon={MdOutlineEdit}
            size={20}
            onClick={() => {
              const cfi = view().contents.cfiFromRange(range)
              reader.focusedBookTab?.rendition?.annotations.mark(cfi)
              selection?.removeAllRanges()
            }}
          />
          <IconButton
            title="Define"
            Icon={MdOutlineAddBox}
            size={20}
            onClick={() => {
              selection?.removeAllRanges()
              reader.focusedBookTab?.toggleDefinition(textContent)
            }}
          />
        </div>
        <div className="mt-2 space-y-2 p-1">
          {keys(typeMap).map((type) => (
            <div key={type} className="flex gap-2">
              {keys(colorMap).map((color) => (
                <div
                  key={color}
                  style={{ [typeMap[type].style]: colorMap[color] }}
                  className={clsx(
                    'typescale-body-large text-on-surface-variant h-6 w-6 cursor-pointer text-center',
                    typeMap[type].class,
                  )}
                  onClick={() => {
                    const cfi = view().contents.cfiFromRange(range)
                    reader.focusedBookTab?.rendition?.annotations.add(
                      type,
                      cfi,
                      undefined,
                      () => {},
                      undefined,
                      {
                        fill: colorMap[color],
                        'fill-opacity': '0.5',
                      },
                    )
                  }}
                >
                  A
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {mobile && (
        <Overlay
          className="!bg-transparent"
          onClick={() => selection?.removeAllRanges()}
        />
      )}
    </>
  )
}
