import { useCallback, useEffect, useState } from 'react'
import { MdSearch } from 'react-icons/md'
import { VscSymbolInterface } from 'react-icons/vsc'
import { useSetRecoilState } from 'recoil'
import { useSnapshot } from 'valtio'

import { useTextSelection } from '../hooks'
import { ReaderTab } from '../models'
import { actionState } from '../state'

import { IconButton } from './Button'
import { reader } from './Reader'

interface TextSelectionMenuProps {
  tab: ReaderTab
}
export const TextSelectionMenu: React.FC<TextSelectionMenuProps> = ({
  tab,
}) => {
  const setAction = useSetRecoilState(actionState)
  const { rendition } = useSnapshot(tab)

  // `manager` is not reactive, so we need to use getter
  const view = useCallback(() => {
    return rendition?.manager?.views._views[0]
  }, [rendition])

  const { rect, textContent } = useTextSelection(view()?.window)

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

  if (!rect || !textContent) return null

  return (
    <div
      className="bg-inverse-surface text-inverse-on-surface absolute flex gap-1 p-0.5"
      style={{ top: rect.top - rect.height - 4, left: rect.left + offsetLeft }}
    >
      <IconButton
        title="Search in book"
        Icon={MdSearch}
        size={20}
        onClick={() => {
          setAction('Search')
          reader.focusedTab?.setKeyword(textContent)
        }}
      />
      <IconButton
        title="Define"
        Icon={VscSymbolInterface}
        size={20}
        onClick={() => {
          reader.focusedTab?.toggleDefinition(textContent)
        }}
      />
    </div>
  )
}
