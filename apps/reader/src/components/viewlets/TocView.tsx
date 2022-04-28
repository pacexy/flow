import { StateLayer } from '@literal-ui/core'
import { useBoolean } from '@literal-ui/hooks'
import clsx from 'clsx'
import type { NavItem as INavItem } from 'epubjs'
import { ComponentProps } from 'react'
import { MdChevronRight, MdExpandMore } from 'react-icons/md'
import { useRecoilValue } from 'recoil'

import { useLibrary } from '@ink/reader/hooks'

import { locationState, navState, renditionState } from '../../state'
import { reader } from '../Reader'

import { Pane } from './Pane'
import { View, ViewProps } from './View'

export const TocView: React.FC<ViewProps> = (props) => {
  return (
    <View {...props}>
      <LibraryPane />
      <TocPane />
    </View>
  )
}

const LibraryPane: React.FC = () => {
  const books = useLibrary()
  return (
    <Pane headline="library" shrinkThreshold={6}>
      {books?.map(({ id, name }) => (
        <button
          key={id}
          className="relative w-full truncate px-5 py-1 text-left"
          title={name}
          draggable
          onClick={() => reader.addTab(id)}
        >
          <StateLayer />
          {name}
        </button>
      ))}
    </Pane>
  )
}

const TocPane: React.FC = () => {
  const nav = useRecoilValue(navState)
  return (
    <Pane headline="toc">
      {nav?.toc.map((item, i) => (
        <NavItem key={i} item={item} />
      ))}
    </Pane>
  )
}

interface NavItemProps extends ComponentProps<'div'> {
  item: INavItem
  level?: number
}
const NavItem: React.FC<NavItemProps> = ({
  className,
  item,
  level = 1,
  ...props
}) => {
  const [open, toggle] = useBoolean(false)
  const rendition = useRecoilValue(renditionState)
  let { label, subitems } = item
  const isLeaf = !subitems || !subitems.length
  const Icon = open ? MdExpandMore : MdChevronRight

  const location = useRecoilValue(locationState)
  const active = location?.start.href === item.href

  label = label.trim()

  return (
    <div className={clsx('', className)} {...props}>
      <a
        className={clsx(
          'relative flex w-full cursor-pointer items-center py-0.5 pr-3 text-left',
          active && 'bg-outline/20',
        )}
        style={{ paddingLeft: level * 8 }}
        onClick={isLeaf ? () => rendition?.display(item.href) : toggle}
        title={label}
      >
        <StateLayer />
        <Icon
          size={20}
          className={clsx('text-outline shrink-0', isLeaf && 'invisible')}
        />
        <div>{label}</div>
      </a>

      {open &&
        subitems?.map((item, i) => (
          <NavItem key={i} item={item} level={level + 1} />
        ))}
    </div>
  )
}
