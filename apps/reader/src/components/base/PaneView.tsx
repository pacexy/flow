import { useBoolean } from '@literal-ui/hooks'
import clsx from 'clsx'
import { ComponentProps, forwardRef } from 'react'
import { MdExpandMore, MdChevronRight } from 'react-icons/md'

import { Action, ActionBar } from '../base'

import { SplitView, useSplitViewItem } from './SplitView'

interface PaneProps extends ComponentProps<'div'> {
  headline: string
  preferredSize?: number
  actions?: Action[]
}
export const Pane = forwardRef<HTMLDivElement, PaneProps>(function Pane(
  { className, headline, preferredSize, children, actions, ...props },
  ref,
) {
  const [expanded, toggle] = useBoolean(true)
  const { size } = useSplitViewItem(headline, {
    preferredSize,
    visible: expanded,
  })
  const Icon = expanded ? MdExpandMore : MdChevronRight
  return (
    <div
      className={clsx('Pane scroll-parent group', size && 'shrink-0')}
      style={{
        height: expanded ? size : 24,
      }}
    >
      <div role="button" className="flex items-center py-0.5" onClick={toggle}>
        <div>
          <Icon size={20} className="text-outline" />
        </div>
        <div className="typescale-label-medium text-on-surface-variant">
          {headline.toUpperCase()}
        </div>
        {actions && (
          <ActionBar
            actions={actions}
            className="ml-auto hidden pr-1 group-hover:flex"
          />
        )}
      </div>
      <div
        ref={ref}
        className={clsx(
          'scroll typescale-body-small text-on-surface-variant',
          !expanded && 'hidden',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
})

export interface PaneViewProps extends ComponentProps<'div'> {
  name: string
  title: string
  actions?: Action[]
}
export function PaneView({
  className,
  name,
  title,
  actions,
  ...props
}: PaneViewProps) {
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
      <SplitView
        vertical
        className={clsx('scroll-parent', className)}
        {...props}
      />
    </>
  )
}
