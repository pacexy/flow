import { StateLayer } from '@literal-ui/core'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { IconType } from 'react-icons'

interface IconButtonProps extends ComponentProps<'div'> {
  Icon: IconType
  size?: number
}
export function IconButton({
  className,
  Icon,
  size = 18,
  ...props
}: IconButtonProps) {
  return (
    <div role="button" className={clsx('relative', className)} {...props}>
      <StateLayer />
      <Icon size={size} />
    </div>
  )
}
