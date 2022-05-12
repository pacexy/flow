import clsx from 'clsx'
import { ElementType, useRef, useEffect } from 'react'
import { PolymorphicPropsWithoutRef } from 'react-polymorphic-types'

type TextFieldProps<T extends ElementType> = PolymorphicPropsWithoutRef<
  {
    name: string
    hideLabel?: boolean
    autoFocus?: boolean
  },
  T
>
export function TextField<T extends ElementType = 'input'>({
  name,
  as,
  className,
  hideLabel = false,
  autoFocus,
  ...props
}: TextFieldProps<T>) {
  const Component = as || 'input'
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])

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
        ref={ref}
        name={name}
        id={name}
        className="typescale-body-medium p-1"
        {...props}
      />
    </div>
  )
}
