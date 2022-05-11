import clsx from 'clsx'
import { ComponentProps } from 'react'

import { Action, ActionBar } from '../base'

export interface ViewProps extends ComponentProps<'div'> {
  name: string
  title: string
  actions?: Action[]
}
export function View({ className, name, title, actions, ...props }: ViewProps) {
  return (
    <>
      <div
        className={clsx(
          'flex items-center justify-between px-5 py-2.5',
          className,
        )}
      >
        <h2 title={title} className="text-on-surface text-[11px]">
          {name?.toUpperCase()}
        </h2>
        {actions && <ActionBar actions={actions} className="-mr-1" />}
      </div>
      <div className={clsx('scroll-parent', className)} {...props} />
    </>
  )
}
