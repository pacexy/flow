import { MdSearch } from 'react-icons/md'
import { VscSymbolVariable } from 'react-icons/vsc'
import { useSetRecoilState } from 'recoil'

import { useTextSelection } from '../hooks'
import { actionState } from '../state'

import { IconButton } from './Button'
import { reader } from './Reader'

interface TextSelectionMenuProps {
  win?: Window
}
export const TextSelectionMenu: React.FC<TextSelectionMenuProps> = ({
  win,
}) => {
  const { rect, textContent } = useTextSelection(win)
  const setAction = useSetRecoilState(actionState)
  if (!rect || !textContent) return null

  return (
    <div
      className="bg-inverse-surface text-inverse-on-surface absolute flex gap-1 p-0.5"
      style={{ top: rect.top - 40, left: rect.left }}
    >
      <IconButton
        Icon={MdSearch}
        size={20}
        onClick={() => {
          setAction('Search')
          reader.focusedTab?.setKeyword(textContent)
        }}
      />
      <IconButton
        Icon={VscSymbolVariable}
        size={20}
        onClick={() => {
          reader.focusedTab?.addDefinition(textContent)
        }}
      />
    </div>
  )
}
