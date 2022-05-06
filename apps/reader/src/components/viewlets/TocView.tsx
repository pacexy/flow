import { StateLayer } from '@literal-ui/core'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import useVirtual from 'react-cool-virtual'
import { MdChevronRight, MdExpandMore } from 'react-icons/md'
import { useSnapshot } from 'valtio'

import { useLibrary } from '@ink/reader/hooks'
import { ReaderTab } from '@ink/reader/models'

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
  const toc = focusedTab?.toc ?? []

  const { outerRef, innerRef, items } = useVirtual<HTMLDivElement>({
    itemCount: toc.length,
    itemSize: 24,
  })

  return (
    <Pane headline="toc" ref={outerRef}>
      <div ref={innerRef}>
        {items.map(
          ({ index }) =>
            reader.focusedTab && (
              <NavItem key={index} index={index} tab={reader.focusedTab} />
            ),
        )}
      </div>
    </Pane>
  )
}

interface NavItemProps extends ComponentProps<'div'> {
  tab: ReaderTab
  index: number
}
const NavItem: React.FC<NavItemProps> = ({
  tab,
  index,
  className,
  ...props
}) => {
  const item = useSnapshot(tab.toc)[index]
  if (!item) return null
  let { label, subitems, depth = 0, expanded, id } = item

  const isLeaf = !subitems || !subitems.length
  const Icon = expanded ? MdExpandMore : MdChevronRight
  const active = tab.location?.start.href === item.href

  label = label.trim()

  return (
    <div className={clsx('', className)} {...props}>
      <a
        className={clsx(
          'relative flex w-full cursor-pointer items-center py-0.5 pr-3 text-left',
          active && 'bg-outline/20',
        )}
        style={{ paddingLeft: depth * 8 }}
        onClick={() => tab.rendition?.display(item.href)}
        title={label}
      >
        <StateLayer />
        <Icon
          size={20}
          className={clsx('text-outline shrink-0', isLeaf && 'invisible')}
          onClick={(e) => {
            e.stopPropagation()
            tab.toggle(id)
          }}
        />
        <div className="truncate">{label}</div>
      </a>
    </div>
  )
}
