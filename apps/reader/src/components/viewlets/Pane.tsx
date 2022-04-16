import { useBoolean } from '@literal-ui/hooks'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { MdExpandMore, MdChevronRight } from 'react-icons/md'

interface PaneProps extends ComponentProps<'div'> {
  headline: string
}
export function Pane({ className, headline, children, ...props }: PaneProps) {
  const [open, toggle] = useBoolean(true)
  const Icon = open ? MdExpandMore : MdChevronRight
  return (
    <div className="scroll-parent">
      <div role="button" className="flex items-center py-0.5" onClick={toggle}>
        <div>
          <Icon size={22} className="text-outline" />
        </div>
        <div className="typescale-label-medium text-on-surface-variant">
          {headline.toUpperCase()}
        </div>
      </div>
      {open && (
        <div className={clsx('scroll', className)} {...props}>
          {children}
        </div>
      )}
    </div>
  )
}
