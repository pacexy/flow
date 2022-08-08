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
  size = 16,
  ...props
}: IconButtonProps) {
  return (
    <div role="button" className={clsx('relative p-0.5', className)} {...props}>
      <StateLayer />
      <Icon size={size} />
    </div>
  )
}

const variantMap = {
  primary: 'bg-tertiary-container text-on-surface',
  secondary: 'bg-outline/10 text-on-surface-variant',
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: keyof typeof variantMap
}
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'typescale-label-large px-3 py-1.5',
        variantMap[variant],
        className,
      )}
      {...props}
    />
  )
}
