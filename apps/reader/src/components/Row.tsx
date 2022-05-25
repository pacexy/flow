import { StateLayer } from '@literal-ui/core'
import clsx from 'clsx'
import { ComponentProps, useEffect, useRef } from 'react'
import { MdExpandMore, MdChevronRight, MdClose } from 'react-icons/md'

import { IconButton } from './Button'

interface RowProps extends ComponentProps<'div'> {
  expanded?: boolean
  active?: boolean
  depth?: number
  label?: string
  description?: string
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
  const onActivateRef = useRef(onActivate)
  onActivateRef.current = onActivate

  const childCount = subitems?.length
  const Icon = expanded ? MdExpandMore : MdChevronRight
  const t = children || label || title

  useEffect(() => {
    if (active) onActivateRef.current?.()
  }, [active])

  return (
    <div
      className={clsx(
        'relative flex cursor-pointer select-none items-center py-0.5 pr-3 text-left',
        active && 'bg-outline/20',
        className,
      )}
      style={{ paddingLeft: depth * 8 }}
      title={title}
      onClick={onClick ?? toggle}
      {...props}
    >
      <StateLayer />
      <Icon
        size={20}
        className={clsx('text-outline shrink-0', !childCount && 'invisible')}
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
      >
        {t || 'Untitled'}
        {description && (
          <span className="text-outline ml-1 text-[11px]">{description}</span>
        )}
      </div>
      <div className="ml-auto">
        {badge && childCount && (
          <div className="bg-tertiary-container text-on-tertiary-container rounded-full px-1.5 py-px text-[11px]">
            {childCount}
          </div>
        )}
        {onDelete && (
          <IconButton
            Icon={MdClose}
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
          />
        )}
      </div>
    </div>
  )
}
