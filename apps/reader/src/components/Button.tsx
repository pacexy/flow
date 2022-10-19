import { StateLayer } from '@literal-ui/core'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { IconType } from 'react-icons'

interface IconButtonProps extends ComponentProps<'button'> {
  Icon: IconType
  size?: number
}
export function IconButton({
  className,
  Icon,
  size = 16,
  ...props
}: IconButtonProps) {
  return (
    <button className={clsx('relative block p-0.5', className)} {...props}>
      <StateLayer />
      <Icon size={size} />
    </button>
  )
}

const variantMap = {
  primary: 'bg-tertiary-container text-on-surface',
  secondary: 'bg-outline/10 text-on-surface-variant',
}

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: keyof typeof variantMap
  compact?: boolean
}
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  compact = false,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'typescale-label-large disabled:bg-disabled disabled:text-on-disabled',
        variantMap[variant],
        compact ? 'px-2 py-1' : 'px-3 py-1.5',
        className,
      )}
      {...props}
    />
  )
}
