import clsx from 'clsx'
import { ComponentProps } from 'react'

interface ViewProps extends ComponentProps<'div'> {}
export function View({ className, ...props }: ViewProps) {
  return <div className={clsx('scroll-parent', className)} {...props} />
}
