import clsx from 'clsx'
import { ComponentProps } from 'react'

interface SelectProps extends ComponentProps<'select'> {}
export const Select: React.FC<SelectProps> = ({ className, ...props }) => {
  return (
    <select
      className={clsx(
        'typescale-body-medium text-on-surface-variant p-0.5',
        className,
      )}
      {...props}
    ></select>
  )
}
