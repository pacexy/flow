import clsx from 'clsx'
import { ElementType, useRef, useEffect, RefObject } from 'react'
import { IconType } from 'react-icons'
import { PolymorphicPropsWithoutRef } from 'react-polymorphic-types'

type Action = {
  Icon: IconType
  onClick: () => void
}

type TextFieldProps<T extends ElementType> = PolymorphicPropsWithoutRef<
  {
    name: string
    hideLabel?: boolean
    autoFocus?: boolean
    actions?: Action[]
    // https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forward_and_create_ref/#generic-forwardrefs
    mRef?: RefObject<HTMLInputElement> | null
  },
  T
>
export function TextField<T extends ElementType = 'input'>({
  name,
  as,
  className,
  hideLabel = false,
  autoFocus,
  mRef: outerRef,
  ...props
}: TextFieldProps<T>) {
  const Component = as || 'input'
  const innerRef = useRef<HTMLInputElement>(null)
  const ref = outerRef || innerRef

  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus, ref])

  return (
    <div className={clsx('flex flex-col', className)}>
      <label
        htmlFor={name}
        className={clsx(
          'typescale-label-medium text-outline mb-1 uppercase',
          hideLabel && 'hidden',
        )}
      >
        {name}
      </label>
      <Component
        ref={ref}
        name={name}
        id={name}
        className="typescale-body-medium bg-outline/10 text-on-surface-variant px-2 py-1"
        {...props}
      />
    </div>
  )
}
