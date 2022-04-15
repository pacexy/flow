import { StateLayer } from '@literal-ui/core'
import { useBoolean } from '@literal-ui/hooks'
import clsx from 'clsx'
import type { NavItem as INavItem } from 'epubjs'
import { ComponentProps } from 'react'
import { MdChevronRight, MdExpandMore } from 'react-icons/md'

interface NavItemProps extends ComponentProps<'div'> {
  item: INavItem
  level?: number
}
export const NavItem: React.FC<NavItemProps> = ({
  className,
  item,
  level = 1,
  ...props
}) => {
  const [open, toggle] = useBoolean(false)
  let { label, subitems } = item
  const isLeaf = !subitems || !subitems.length
  const Icon = open ? MdExpandMore : MdChevronRight

  label = label.trim()

  return (
    <div className={clsx('', className)} title={label} {...props}>
      <a
        className="relative flex w-full cursor-pointer items-center py-0.5 pr-3 text-left"
        style={{ paddingLeft: level * 8 }}
        onClick={toggle}
      >
        <StateLayer />
        <Icon
          size={22}
          className={clsx('text-outline shrink-0', isLeaf && 'invisible')}
        />
        <div className="typescale-body-small text-on-surface-variant">
          {label}
        </div>
      </a>

      {open &&
        subitems?.map((item, i) => (
          <NavItem key={i} item={item} level={level + 1} />
        ))}
    </div>
  )
}
