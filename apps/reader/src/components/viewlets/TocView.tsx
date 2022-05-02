import { StateLayer } from '@literal-ui/core'
import { useBoolean } from '@literal-ui/hooks'
import clsx from 'clsx'
import type { NavItem as INavItem } from 'epubjs'
import { ComponentProps } from 'react'
import { MdChevronRight, MdExpandMore } from 'react-icons/md'
import { ReadonlyDeep } from 'type-fest'
import { useSnapshot } from 'valtio'

import { useLibrary } from '@ink/reader/hooks'

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
      {books?.map((book) => (
        <button
          key={book.id}
          className="relative w-full truncate px-5 py-1 text-left"
          title={book.name}
          draggable
          onClick={() => reader.addTab(book)}
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', book.id)
          }}
        >
          <StateLayer />
          {book.name}
        </button>
      ))}
    </Pane>
  )
}

const TocPane: React.FC = () => {
  const { focusedTab } = useSnapshot(reader)
  return (
    <Pane headline="toc">
      {focusedTab?.nav?.toc.map((item, i) => (
        <NavItem key={i} item={item} />
      ))}
    </Pane>
  )
}

interface NavItemProps extends ComponentProps<'div'> {
  item: ReadonlyDeep<INavItem>
  level?: number
}
const NavItem: React.FC<NavItemProps> = ({
  className,
  item,
  level = 1,
  ...props
}) => {
  const [open, toggle] = useBoolean(false)
  const { focusedTab: tab } = useSnapshot(reader)
  let { label, subitems } = item

  const isLeaf = !subitems || !subitems.length
  const Icon = open ? MdExpandMore : MdChevronRight
  const active = tab?.location?.start.href === item.href

  label = label.trim()

  return (
    <div className={clsx('', className)} {...props}>
      <a
        className={clsx(
          'relative flex w-full cursor-pointer items-center py-0.5 pr-3 text-left',
          active && 'bg-outline/20',
        )}
        style={{ paddingLeft: level * 8 }}
        onClick={() => tab?.rendition?.display(item.href)}
        title={label}
      >
        <StateLayer />
        <Icon
          size={20}
          className={clsx('text-outline shrink-0', isLeaf && 'invisible')}
          onClick={(e) => {
            e.stopPropagation()
            toggle()
          }}
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
