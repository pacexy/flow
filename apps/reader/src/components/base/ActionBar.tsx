import clsx from 'clsx'
import { ComponentProps } from 'react'
import { IconType } from 'react-icons'

import { IconButton } from '../Button'

export interface Action {
  id: string
  title: string
  Icon: IconType
  handle: () => void
}

interface ActionBarProps extends ComponentProps<'ul'> {
  actions: Action[]
}
export const ActionBar: React.FC<ActionBarProps> = ({ actions, className }) => {
  return (
    <ul className={clsx('text-on-surface-variant flex gap-1', className)}>
      {actions.map(({ id, title, Icon, handle }) => (
        <li key={id} title={title}>
          <IconButton
            Icon={Icon}
            onClick={(e) => {
              e.stopPropagation()
              handle()
            }}
          />
        </li>
      ))}
    </ul>
  )
}
