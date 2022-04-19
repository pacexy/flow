import { StateLayer } from '@literal-ui/core'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { MdClose } from 'react-icons/md'

import { IconButton } from './Button'

interface TabProps extends ComponentProps<'button'> {
  onDelete?: () => void
  selected?: boolean
  focused?: boolean
  children?: string
}
export function Tab({
  focused,
  className,
  children,
  onDelete,
  ...props
}: TabProps) {
  if (!children) return null
  return (
    <button
      className={clsx(
        'text-on-surface-variant typescale-body-small relative flex items-center gap-2 p-2',
        className,
      )}
      title={children}
      {...props}
    >
      <StateLayer />
      {focused && (
        <div className="bg-tertiary-container absolute inset-x-0 top-0 h-0.5" />
      )}
      <span className="max-w-[200px] truncate">{children}</span>
      <IconButton Icon={MdClose} onClick={onDelete} />
    </button>
  )
}

interface ListProps extends ComponentProps<'ul'> {}
const List: React.FC<ListProps> = ({ className, ...props }) => {
  return <ul className={clsx('flex', className)} {...props} />
}

Tab.List = List
