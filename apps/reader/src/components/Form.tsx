import clsx from 'clsx'
import {
  ElementType,
  useRef,
  useEffect,
  RefObject,
  ComponentProps,
} from 'react'
import { IconType } from 'react-icons'
import { MdCheck, MdClose } from 'react-icons/md'
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
    if (mobile === false && autoFocus) {
      setTimeout(() => {
        ref.current?.focus()
      })
    }
  }, [autoFocus, mobile, ref])

  return (
    <div className={clsx('flex flex-col', className)}>
      <Label name={name} hide={hideLabel}>
        {name}
      </Label>
      <div className="bg-default textfield flex grow items-center">
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

interface CheckboxProps extends ComponentProps<'input'> {
  name: string
}
export const Checkbox: React.FC<CheckboxProps> = ({ name, ...props }) => {
  return (
    <div className="flex items-center">
      <Label name={name} />
      <div className="checkbox bg-default relative ml-auto rounded-sm">
        <input
          type="checkbox"
          name={name}
          id={name}
          className="peer block h-4 w-4 appearance-none"
          {...props}
        />
        <MdCheck className="text-on-surface-variant pointer-events-none invisible absolute top-0 peer-checked:visible" />
      </div>
    </div>
  )
}

interface SelectProps extends ComponentProps<'select'> {
  name?: string
}
export const Select: React.FC<SelectProps> = ({
  name,
  className,
  ...props
}) => {
  return (
    <div className={clsx('flex flex-col', className)}>
      {name && <Label name={name} />}
      <select
        name={name}
        id={name}
        className={clsx(
          'typescale-body-medium text-on-surface-variant bg-default max-w-xs px-0.5 py-1 !text-[13px]',
        )}
        {...props}
      ></select>
    </div>
  )
}

interface ColorPickerProps extends ComponentProps<'input'> {
  name?: string
}
export const ColorPicker: React.FC<ColorPickerProps> = ({
  name,
  className,
  ...props
}) => {
  return (
    <div className={clsx('flex flex-col', className)}>
      {name && <Label name={name} />}
      <input
        type="color"
        name={name}
        id={name}
        className="h-6 w-12"
        {...props}
      />
    </div>
  )
}

interface LabelProps extends ComponentProps<'label'> {
  name: string
  hide?: boolean
}
export const Label: React.FC<LabelProps> = ({
  name,
  hide = false,
  className,
}) => {
  return (
    <label
      htmlFor={name}
      className={clsx(
        'typescale-label-medium text-on-surface-variant mb-1 block !text-[13px]',
        hide && 'hidden',
        className,
      )}
    >
      {name}
    </label>
  )
}
