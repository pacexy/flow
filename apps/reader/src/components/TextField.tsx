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
  onClick: (el: HTMLInputElement | null) => void
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
  const isInput = Component === 'input'
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
      <div className="bg-outline/5 textfield flex grow items-center">
        <Component
          ref={ref}
          name={name}
          id={name}
          className={clsx(
            'typescale-body-medium text-on-surface-variant placeholder:text-outline/60 w-0 flex-1 bg-transparent py-1 px-1.5 !text-[13px]',
            isInput || 'scroll h-full resize-none',
          )}
          {...props}
        />
        {!!actions.length && (
          <div className="mx-1 flex gap-0.5">
            {actions.map(({ onClick, ...a }) => (
              <IconButton
                className="text-outline !p-px"
                key={a.title}
                onClick={() => {
                  onClick(ref.current)
                }}
                {...a}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
