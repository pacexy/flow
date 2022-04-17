import { useBoolean } from '@literal-ui/hooks'
import clsx from 'clsx'
import { Children, ComponentProps } from 'react'
import { MdExpandMore, MdChevronRight } from 'react-icons/md'

interface PaneProps extends ComponentProps<'div'> {
  headline: string
  /**
   * If count of line is greater than threshold and
   * space is not enough, the container will shrink to
   * the threshold.
   */
  shrinkThreshold?: number
}
export function Pane({
  className,
  headline,
  children,
  shrinkThreshold = 0,
  ...props
}: PaneProps) {
  const [open, toggle] = useBoolean(true)
  const Icon = open ? MdExpandMore : MdChevronRight
  const n = open ? Children.count(children) : 0
  const minLine = Math.min(n, shrinkThreshold)
  return (
    <div
      className="scroll-parent select-none"
      style={{
        minHeight: (minLine + 1) * 24,
      }}
    >
      <div role="button" className="flex items-center py-0.5" onClick={toggle}>
        <div>
          <Icon size={20} className="text-outline" />
        </div>
        <div className="typescale-label-medium text-on-surface-variant">
          {headline.toUpperCase()}
        </div>
      </div>
      {open && (
        <div
          className={clsx(
            'scroll typescale-body-small text-on-surface-variant',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      )}
    </div>
  )
}
