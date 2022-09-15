import { Overlay } from '@literal-ui/core'
import { useEventListener } from '@literal-ui/hooks'
import { useCallback, useEffect, useState } from 'react'
import { MdSearch } from 'react-icons/md'
import { VscSymbolInterface } from 'react-icons/vsc'
import { useSetRecoilState } from 'recoil'
import { useSnapshot } from 'valtio'

import { useMobile, useTextSelection } from '../hooks'
import { BookTab } from '../models'
import { actionState } from '../state'

import { IconButton } from './Button'
import { reader } from './Reader'

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

  const { selection, rect, textContent } = useTextSelection(win)

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

  if (!display || !rect || !textContent) return null

  return (
    <>
      <div
        className="bg-inverse-surface text-inverse-on-surface absolute z-20 flex -translate-x-1/2 gap-1 p-0.5"
        style={{
          top: rect.bottom,
          left: rect.right + offsetLeft,
        }}
      >
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
          title="Define"
          Icon={VscSymbolInterface}
          size={20}
          onClick={() => {
            selection?.removeAllRanges()
            reader.focusedBookTab?.toggleDefinition(textContent)
          }}
        />
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
