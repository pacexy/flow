import { StateLayer } from '@literal-ui/core'
import { useBoolean } from '@literal-ui/hooks'
import clsx from 'clsx'
import type { NavItem as INavItem } from 'epubjs'
import { ComponentProps } from 'react'
import { MdExpandLess, MdExpandMore } from 'react-icons/md'

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
  const Icon = open ? MdExpandLess : MdExpandMore

  label = label.trim()

  return (
    <div className={clsx('', className)} title={label} {...props}>
      <button
        className="text-on-surface-variant relative flex w-full items-center justify-between py-1 pr-3 text-left"
        style={{ paddingLeft: level * 12 }}
      >
        <StateLayer />
        <div className="typescale-body-medium">{label}</div>
        <div role="button" className="relative ml-2">
          <StateLayer />
          {!isLeaf && <Icon size={22} onClick={toggle} />}
        </div>
      </button>

      {open &&
        subitems?.map((item, i) => (
          <NavItem key={i} item={item} level={level + 1} />
        ))}
    </div>
  )
}
