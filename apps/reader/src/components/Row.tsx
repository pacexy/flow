import { StateLayer } from '@literal-ui/core'
import clsx from 'clsx'
import { ComponentProps, useEffect, useRef } from 'react'
import { MdExpandMore, MdChevronRight } from 'react-icons/md'

interface RowProps extends ComponentProps<'div'> {
  label: string
  expanded?: boolean
  active?: boolean
  depth?: number
  children?: Readonly<any[]>
  toggle?: () => void
  onActivate?: () => void
}
export const Row: React.FC<RowProps> = ({
  label,
  expanded = false,
  active = false,
  depth = 0,
  children,
  toggle,
  onActivate,
  className,
  ...props
}) => {
  const onActivateRef = useRef(onActivate)
  onActivateRef.current = onActivate

  const isLeaf = !children || !children.length
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
      title={label}
      {...props}
    >
      <StateLayer />
      <Icon
        size={20}
        className={clsx('text-outline shrink-0', isLeaf && 'invisible')}
        onClick={(e) => {
          e.stopPropagation()
          toggle?.()
        }}
      />
      <div className="typescale-body-small text-on-surface-variant truncate">
        {label}
      </div>
    </div>
  )
}
