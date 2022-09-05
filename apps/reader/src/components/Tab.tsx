import clsx from 'clsx'
import { ComponentProps } from 'react'
import { IconType } from 'react-icons'
import { MdClose } from 'react-icons/md'

import { IconButton } from './Button'

interface TabProps extends ComponentProps<'div'> {
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
    <div
      role="tab"
      className={clsx(
        ' typescale-body-small relative flex cursor-pointer items-center gap-1 p-2 pr-1',
        selected
          ? 'text-outline bg-white dark:bg-[#121212]'
          : 'text-outline/60 hover:bg-white dark:hover:bg-[#121212]',
        focused && '!text-on-surface',
        className,
      )}
      title={children}
      {...props}
    >
      {focused && (
        <div className="absolute inset-x-0 top-0 h-px bg-orange-400" />
      )}
      <Icon size={16} className="text-outline" />
      <span className="max-w-[200px] truncate">{children}</span>
      <IconButton
        Icon={MdClose}
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.()
        }}
      />
    </div>
  )
}

interface ListProps extends ComponentProps<'ul'> {
  onDelete?: () => void
}
const List: React.FC<ListProps> = ({ className, onDelete, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-outline/5 flex items-center justify-between',
        className,
      )}
    >
      <ul className={clsx('scroll-h flex')} {...props} />
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
