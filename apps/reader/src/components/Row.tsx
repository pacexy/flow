import { StateLayer } from '@literal-ui/core'
import clsx from 'clsx'
import { ComponentProps, useEffect, useRef } from 'react'
import { MdClose } from 'react-icons/md'
import { VscChevronDown, VscChevronRight } from 'react-icons/vsc'

import { LIST_ITEM_SIZE, useTranslation } from '../hooks'
import { scale } from '../platform'

import { IconButton } from './Button'

interface RowProps extends ComponentProps<'div'> {
  expanded?: boolean
  active?: boolean
  depth?: number
  label?: string
  description?: string | number
  info?: string
  subitems?: Readonly<any[]>
  toggle?: () => void
  onActivate?: () => void
  onDelete?: () => void
  badge?: boolean
}
export const Row: React.FC<RowProps> = ({
  title,
  label,
  description,
  info,
  expanded = false,
  active = false,
  depth = 0,
  subitems,
  toggle,
  onActivate,
  className,
  children,
  badge,
  onClick,
  onDelete,
  ...props
}) => {
  const trans = useTranslation()
  const onActivateRef = useRef(onActivate)
  onActivateRef.current = onActivate

  const childCount = subitems?.length
  const t = children || label || title

  useEffect(() => {
    if (active) onActivateRef.current?.()
  }, [active])

  return (
    <div
      className={clsx(
        'list-row relative flex cursor-pointer items-center text-left',
        active && 'bg-outline/20',
        className,
      )}
      style={{
        paddingLeft: depth * 8,
        paddingRight: 12,
        height: LIST_ITEM_SIZE,
      }}
      title={title}
      onClick={onClick ?? toggle}
      {...props}
    >
      <StateLayer />
      <Twisty
        expanded={expanded}
        className={clsx(!childCount && 'invisible')}
        onClick={(e) => {
          e.stopPropagation()
          toggle?.()
        }}
      />
      <div
        className={clsx(
          'typescale-body-small truncate',
          t ? 'text-on-surface-variant' : 'text-outline/60',
        )}
        style={{
          fontSize: scale(12, 14),
          marginLeft: scale(0, 2),
        }}
      >
        {t || trans('untitled')}
        {description && (
          <span
            className="text-outline"
            style={{
              fontSize: scale(11, 12),
              marginLeft: scale(4, 6),
            }}
          >
            {description}
          </span>
        )}
      </div>
      <div className="ml-auto">
        {badge && childCount && (
          <div
            className="bg-tertiary-container text-on-tertiary-container rounded-full px-1.5 py-px"
            style={{
              fontSize: scale(11, 12),
            }}
          >
            {childCount}
          </div>
        )}
        {onDelete && (
          <IconButton
            className="action hidden"
            Icon={MdClose}
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
          />
        )}
        <span className="text-outline">{info}</span>
      </div>
    </div>
  )
}

interface TwistyProps extends ComponentProps<'svg'> {
  expanded: boolean
}
export const Twisty: React.FC<TwistyProps> = ({
  expanded,
  className,
  ...props
}) => {
  const Icon = expanded ? VscChevronDown : VscChevronRight
  return (
    <Icon
      size={20}
      className={clsx('text-outline shrink-0', className)}
      style={{ padding: scale(2, 1) }}
      {...props}
    />
  )
}
