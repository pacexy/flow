import { Overlay } from '@literal-ui/core'
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
import { isForwardSelection, useTextSelection } from '../hooks'
import { BookTab } from '../models'
import { actionState } from '../state'
import { keys, last } from '../utils'

import { IconButton } from './Button'
import { TextField } from './TextField'

interface TextSelectionMenuProps {
  tab: BookTab
}
export const TextSelectionMenu: React.FC<TextSelectionMenuProps> = ({
  tab,
}) => {
  const { rendition, annotationRange } = useSnapshot(tab)

  // `manager` is not reactive, so we need to use getter
  const view = useCallback(() => {
    return rendition?.manager?.views._views[0]
  }, [rendition])

  const win = view()?.window
  const [selection, setSelection] = useTextSelection(win)

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

  const range = annotationRange ?? selection?.getRangeAt(0)

  if (!range) return null

  const forward = selection ? isForwardSelection(selection) : true

  const rects = [...range.getClientRects()].filter((r) => r.width)
  const rect = rects && (forward ? last(rects) : rects[0])
  if (!rect) return null

  const contents = range.cloneContents()
  const text = contents.textContent?.trim()
  if (!text) return null

  return (
    // to reset inner state
    <TextSelectionMenuRenderer
      tab={tab}
      range={range as Range}
      rect={rect}
      text={text}
      forward={forward}
      offsetLeft={offsetLeft}
      hide={() => {
        if (selection) {
          selection.removeAllRanges()
          setSelection(undefined)
        } else if (tab.annotationRange) {
          tab.annotationRange = undefined
        }
      }}
    />
  )
}

interface TextSelectionMenuRendererProps {
  tab: BookTab
  range: Range
  rect: DOMRect
  text: string
  forward?: boolean
  offsetLeft: number
  hide: () => void
}
export const TextSelectionMenuRenderer: React.FC<
  TextSelectionMenuRendererProps
> = ({ tab, range, rect, text, forward, offsetLeft, hide }) => {
  const setAction = useSetRecoilState(actionState)
  const ref = useRef<HTMLInputElement>(null)
  const [annotate, setAnnotate] = useState(false)

  return (
    <>
      <Overlay
        // cover `sash`
        className="!z-50 !bg-transparent"
        onMouseDown={hide}
      />
      <div
        className={clsx(
          'bg-surface text-on-surface-variant shadow-1 absolute z-50 -translate-x-1/2 p-2',
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
                hide()
                setAction('Search')
                tab.setKeyword(text)
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
            {tab.isDefined(text) ? (
              <IconButton
                title="Undefine"
                Icon={MdOutlineIndeterminateCheckBox}
                size={20}
                onClick={() => {
                  hide()
                  tab.undefine(text)
                }}
              />
            ) : (
              <IconButton
                title="Define"
                Icon={MdOutlineAddBox}
                size={20}
                onClick={() => {
                  hide()
                  tab.define(text)
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
                    tab.annotate(type, range, color, text, ref.current?.value)
                    hide()
                  }}
                >
                  A
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
