import clsx from 'clsx'
import { ElementType, useRef, useEffect, RefObject } from 'react'
import { IconType } from 'react-icons'
import { MdClose } from 'react-icons/md'
import { PolymorphicPropsWithoutRef } from 'react-polymorphic-types'

import { useMobile } from '../hooks'

import { IconButton } from './Button'

type Action = {
  title: string
  Icon: IconType
  onClick: () => void
}

export type TextFieldProps<T extends ElementType> = PolymorphicPropsWithoutRef<
  {
    name: string
    hideLabel?: boolean
    autoFocus?: boolean
    actions?: Action[]
    onClear?: () => void
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
  actions = [],
  onClear,
  mRef: outerRef,
  ...props
}: TextFieldProps<T>) {
  const Component = as || 'input'
  const innerRef = useRef<HTMLInputElement>(null)
  const ref = outerRef || innerRef
  const mobile = useMobile()

  if (onClear) {
    actions = [
      ...actions,
      {
        title: 'Clear',
        Icon: MdClose,
        onClick: onClear,
      },
    ]
  }

  useEffect(() => {
    if (mobile === false && autoFocus) ref.current?.focus()
  }, [autoFocus, mobile, ref])

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
      <div className="bg-outline/10 textfield text-on-surface-variant flex items-center px-1">
        <Component
          ref={ref}
          name={name}
          id={name}
          className="typescale-body-medium w-0 flex-1 bg-transparent py-1"
          {...props}
        />
        <div className="flex gap-0.5">
          {actions.map((a) => (
            <IconButton className="text-outline !p-px" key={a.title} {...a} />
          ))}
        </div>
      </div>
    </div>
  )
}
