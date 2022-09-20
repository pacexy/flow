import { StateLayer } from '@literal-ui/core'
import { VscCollapseAll, VscExpandAll } from 'react-icons/vsc'
import { useSnapshot } from 'valtio'

import { useLibrary, useList, useMobile } from '@ink/reader/hooks'
import { compareHref, dfs, flatTree, INavItem } from '@ink/reader/models'

import { reader } from '../Reader'
import { Row } from '../Row'
import { PaneViewProps, PaneView, Pane } from '../base'

export const TocView: React.FC<PaneViewProps> = (props) => {
  const mobile = useMobile()
  return (
    <PaneView {...props}>
      {mobile || <LibraryPane />}
      <TocPane />
    </PaneView>
  )
}

const LibraryPane: React.FC = () => {
  const books = useLibrary()
  return (
    <Pane headline="library" preferredSize={240}>
      {books?.map((book) => (
        <button
          key={book.id}
          className="relative w-full truncate py-1 pl-5 pr-3 text-left"
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
  const { focusedBookTab } = useSnapshot(reader)
  const toc = focusedBookTab?.nav?.toc as INavItem[] | undefined
  const rows = toc?.flatMap((i) => flatTree(i))
  const expanded = toc?.some((r) => r.expanded)

  const { outerRef, innerRef, items, scrollToItem } = useList(rows)

  return (
    <Pane
      headline="toc"
      ref={outerRef}
      actions={[
        {
          id: expanded ? 'collapse-all' : 'expand-all',
          title: expanded ? 'Collapse All' : 'Expand All',
          Icon: expanded ? VscCollapseAll : VscExpandAll,
          handle() {
            reader.focusedBookTab?.nav?.toc?.forEach((r) =>
              dfs(r as INavItem, (i) => (i.expanded = !expanded)),
            )
          },
        },
      ]}
    >
      {rows && (
        <div ref={innerRef}>
          {items.map(({ index }) => (
            <TocRow
              key={index}
              item={rows[index]}
              onActivate={() => scrollToItem(index)}
            />
          ))}
        </div>
      )}
    </Pane>
  )
}

interface TocRowProps {
  item?: INavItem
  onActivate: () => void
}
const TocRow: React.FC<TocRowProps> = ({ item, onActivate }) => {
  if (!item) return null
  const { label, subitems, depth, expanded, id, href } = item
  const tab = reader.focusedBookTab
  const navItem = tab?.currentNavItem

  return (
    <Row
      title={label.trim()}
      depth={depth}
      active={href === navItem?.href}
      expanded={expanded}
      subitems={subitems}
      onClick={() => {
        const [, id] = href.split('#')
        const section = tab?.sections?.find((s) => compareHref(s.href, href))

        if (!section) return

        if (id) {
          tab?.displayFromSelector(`#${id}`, section, false)
        } else {
          tab?.display(section.href, false)
        }
      }}
      toggle={() => tab?.toggle(id)}
      onActivate={onActivate}
    />
  )
}
