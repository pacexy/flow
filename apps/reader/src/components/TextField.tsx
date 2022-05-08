import clsx from 'clsx'
import { ElementType } from 'react'
import { PolymorphicPropsWithoutRef } from 'react-polymorphic-types'

type TextFieldProps<T extends ElementType> = PolymorphicPropsWithoutRef<
  {
    name: string
    hideLabel?: boolean
  },
  T
>
export function TextField<T extends ElementType = 'input'>({
  name,
  as,
  className,
  hideLabel = false,
  ...props
}: TextFieldProps<T>) {
  const Component = as || 'input'
  return (
    <div
      className={clsx(
        'text-on-surface-variant flex flex-col gap-2 px-5',
        className,
      )}
    >
      <label
        htmlFor={name}
        className={clsx(
          'typescale-label-medium uppercase',
          hideLabel && 'hidden',
        )}
      >
        {name}
      </label>
      <Component
        name={name}
        id={name}
        className="typescale-body-medium p-1"
        {...props}
      />
    </div>
  )
}
