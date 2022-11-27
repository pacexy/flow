import clsx from 'clsx'
import { ComponentProps } from 'react'
import { IconType } from 'react-icons'
import { MdClose } from 'react-icons/md'

import { useBackground, useTranslation } from '../hooks'
import { activeClass } from '../styles'

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
  const [bg] = useBackground()
  const t = useTranslation()

  if (!children) return null
  return (
    <div
      role="tab"
      className={clsx(
        ' typescale-body-small relative flex cursor-pointer items-center gap-1 p-2 pr-1',
        selected ? `text-outline ${bg}` : `text-outline/60 hover:${bg}`,
        focused && '!text-on-surface',
        className,
      )}
      title={children}
      {...props}
    >
      {focused && (
        <div className={clsx('absolute inset-x-0 top-0 h-px', activeClass)} />
      )}
      <Icon size={16} className="text-outline" />
      <span className="max-w-[200px] truncate">{children}</span>
      <IconButton
        title={t('action.close')}
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
  const t = useTranslation()

  return (
    <div
      className={clsx(
        'bg-primary/5 flex items-center justify-between',
        className,
      )}
    >
      <ul className={clsx('scroll-h flex')} {...props} />
      <IconButton
        className="mx-2"
        title={t('action.close')}
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
