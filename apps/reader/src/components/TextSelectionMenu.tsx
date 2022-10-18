import { Overlay } from '@literal-ui/core'
import { useEventListener } from '@literal-ui/hooks'
import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MdOutlineAddBox,
  MdOutlineEdit,
  MdOutlineIndeterminateCheckBox,
  MdSearch,
} from 'react-icons/md'
import { useSetRecoilState } from 'recoil'
import { useSnapshot } from 'valtio'

import { typeMap, colorMap } from '../annotation'
import { useMobile, useTextSelection } from '../hooks'
import { BookTab } from '../models'
import { actionState } from '../state'
import { keys, last } from '../utils'

import { IconButton } from './Button'
import { reader } from './Reader'
import { TextField } from './TextField'

interface TextSelectionMenuProps {
  tab: BookTab
}
export const TextSelectionMenu: React.FC<TextSelectionMenuProps> = ({
  tab,
}) => {
  const { rendition } = useSnapshot(tab)
  const [display, setDisplay] = useState(false)

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

  const text = textContent.trim()

  return (
    <TextSelectionMenuRenderer
      view={view}
      selection={selection}
      range={range}
      rect={rect}
      text={text}
      forward={forward}
      offsetLeft={offsetLeft}
    />
  )
}

interface TextSelectionMenuRendererProps {
  view: () => any
  selection?: Selection
  range: Range
  rect: DOMRect
  text: string
  forward?: boolean
  offsetLeft: number
}
export const TextSelectionMenuRenderer: React.FC<
  TextSelectionMenuRendererProps
> = ({ view, selection, range, rect, text, forward, offsetLeft }) => {
  const setAction = useSetRecoilState(actionState)
  const ref = useRef<HTMLInputElement>(null)
  const [annotate, setAnnotate] = useState(false)
  const mobile = useMobile()

  return (
    <>
      <div
        className={clsx(
          'bg-surface text-on-surface-variant shadow-1 absolute z-20 -translate-x-1/2 p-2',
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
        {annotate ? (
          <div className="mb-3">
            <TextField
              mRef={ref}
              as="textarea"
              name="notes"
              hideLabel
              className="h-40 w-72"
            />
          </div>
        ) : (
          <div className="-m-1 mb-3 flex gap-1">
            <IconButton
              title="Search in book"
              Icon={MdSearch}
              size={20}
              onClick={() => {
                selection?.removeAllRanges()
                setAction('Search')
                reader.focusedBookTab?.setKeyword(text)
              }}
            />
            <IconButton
              title="Annotate"
              Icon={MdOutlineEdit}
              size={20}
              onClick={() => {
                setAnnotate(true)
              }}
            />
            {reader.focusedBookTab?.isDefined(text) ? (
              <IconButton
                title="Undefine"
                Icon={MdOutlineIndeterminateCheckBox}
                size={20}
                onClick={() => {
                  selection?.removeAllRanges()
                  reader.focusedBookTab?.undefine(text)
                }}
              />
            ) : (
              <IconButton
                title="Define"
                Icon={MdOutlineAddBox}
                size={20}
                onClick={() => {
                  selection?.removeAllRanges()
                  reader.focusedBookTab?.define(text)
                }}
              />
            )}
          </div>
        )}
        <div className="space-y-2">
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
                    reader.focusedBookTab?.annotate(
                      type,
                      cfi,
                      color,
                      text,
                      ref.current?.value,
                    )
                    selection?.removeAllRanges()
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
