import { ComponentProps } from 'react'
import { IconType } from 'react-icons'

import { IconButton } from '../Button'

export interface Action {
  id: string
  title: string
  Icon: IconType
  handle: () => void
}

interface ActionBarProps extends ComponentProps<'div'> {
  actions: Action[]
}
export const ActionBar: React.FC<ActionBarProps> = ({ actions }) => {
  return (
    <ul className="text-on-surface-variant flex gap-1">
      {actions.map(({ id, title, Icon, handle }) => (
        <li key={id} title={title}>
          <IconButton Icon={Icon} onClick={handle} />
        </li>
      ))}
    </ul>
  )
}
