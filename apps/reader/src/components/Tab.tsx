import clsx from 'clsx'
import { ComponentProps } from 'react'
import { IconType } from 'react-icons'
import { MdClose } from 'react-icons/md'

import { IconButton } from './Button'

interface TabProps extends ComponentProps<'button'> {
  onDelete?: () => void
  selected?: boolean
  focused?: boolean
  Icon: IconType
  children?: string
}
export function Tab({
  selected,
  focused,
  Icon,
  className,
  children,
  onDelete,
  ...props
}: TabProps) {
  if (!children) return null
  return (
    <button
      className={clsx(
        'text-on-surface-variant typescale-body-small relative flex items-center gap-1 p-2',
        selected
          ? 'bg-white dark:bg-[#121212]'
          : 'hover:bg-white dark:hover:bg-[#121212]',
        className,
      )}
      title={children}
      {...props}
    >
      {focused && <div className="absolute inset-x-0 top-0 h-px bg-blue-400" />}
      <Icon size={16} className="text-outline" />
      <span className="max-w-[200px] truncate">{children}</span>
      <IconButton
        Icon={MdClose}
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.()
        }}
      />
    </button>
  )
}

interface ListProps extends ComponentProps<'ul'> {
  onDelete?: () => void
}
const List: React.FC<ListProps> = ({ className, onDelete, ...props }) => {
  return (
    <div className="bg-outline/5 flex items-center justify-between">
      <ul className={clsx('scroll-h flex', className)} {...props} />
      <IconButton
        className="mx-2"
        Icon={MdClose}
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.()
        }}
      />
    </div>
  )
}

Tab.List = List
