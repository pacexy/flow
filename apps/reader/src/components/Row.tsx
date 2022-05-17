import { StateLayer } from '@literal-ui/core'
import clsx from 'clsx'
import { ComponentProps, useEffect, useRef } from 'react'
import { MdExpandMore, MdChevronRight } from 'react-icons/md'

interface RowProps extends ComponentProps<'div'> {
  expanded?: boolean
  active?: boolean
  depth?: number
  label?: string
  description?: string
  subitems?: Readonly<any[]>
  toggle?: () => void
  onActivate?: () => void
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
  ...props
}) => {
  const onActivateRef = useRef(onActivate)
  onActivateRef.current = onActivate

  const childCount = subitems?.length
  const Icon = expanded ? MdExpandMore : MdChevronRight

  useEffect(() => {
    if (active) onActivateRef.current?.()
  }, [active])

  return (
    <div
      className={clsx(
        'relative flex cursor-pointer items-center py-0.5 pr-3 text-left',
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
      <div className="typescale-body-small text-on-surface-variant truncate">
        {children || label || title}
        {description && (
          <span className="text-outline ml-1 text-[11px]">{description}</span>
        )}
      </div>
      {badge && childCount && (
        <div className="bg-tertiary-container text-on-tertiary-container ml-auto rounded-full px-1.5 py-px text-[11px]">
          {childCount}
        </div>
      )}
    </div>
  )
}
