import { StateLayer } from '@literal-ui/core'
import { useMemo } from 'react'
import { VscCollapseAll, VscExpandAll } from 'react-icons/vsc'

import {
  useLibrary,
  useList,
  useMobile,
  useTranslation,
} from '@flow/reader/hooks'
import {
  dfs,
  flatTree,
  INavItem,
  INavItemSnapshot,
  reader,
  useReaderSnapshot,
} from '@flow/reader/models'

import { Row } from '../Row'
import { PaneViewProps, PaneView, Pane } from '../base'

const EMPTY_OBJECT = {}

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
  const t = useTranslation('toc')
  return (
    <Pane headline={t('library')} preferredSize={240}>
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
  const t = useTranslation()
  const { focusedBookTab } = useReaderSnapshot()
  const toc = focusedBookTab?.nav?.toc as INavItemSnapshot[] | undefined
  const expandedState = focusedBookTab?.tocExpandedState ?? EMPTY_OBJECT
  const rows = useMemo(
    () => toc?.flatMap((i) => flatTree(i, 1, expandedState)),
    [toc, expandedState],
  )
  const expanded = rows?.some((r) => r.expanded)
  const currentNavItem = focusedBookTab?.currentNavItem as
    | INavItemSnapshot
    | undefined

  const { outerRef, innerRef, items, scrollToItem } = useList(rows)

  return (
    <Pane
      headline={t('toc.title')}
      ref={outerRef}
      actions={[
        {
          id: expanded ? 'collapse-all' : 'expand-all',
          title: t(expanded ? 'action.collapse_all' : 'action.expand_all'),
          Icon: expanded ? VscCollapseAll : VscExpandAll,
          handle() {
            if (reader.focusedBookTab) {
              const newState = !expanded
              const newExpandedState: Record<string, boolean> = {}
              reader.focusedBookTab.nav?.toc?.forEach((r) =>
                dfs(r as INavItem, (i) => {
                  newExpandedState[i.id] = newState
                }),
              )
              reader.focusedBookTab.tocExpandedState = newExpandedState
            }
          },
        },
      ]}
    >
      {rows && (
        <div ref={innerRef}>
          {items.map(({ index }) => {
            const item = rows[index]
            if (!item) return null
            return (
              <TocRow
                key={item.id}
                currentNavItem={currentNavItem}
                item={item}
                onActivate={() => scrollToItem(index)}
              />
            )
          })}
        </div>
      )}
    </Pane>
  )
}

interface TocRowProps {
  currentNavItem?: INavItemSnapshot
  item: INavItemSnapshot
  onActivate: () => void
}
const TocRow: React.FC<TocRowProps> = ({
  currentNavItem,
  item,
  onActivate,
}) => {
  const { label, subitems, depth, expanded, id, href } = item

  return (
    <Row
      title={label.trim()}
      depth={depth}
      active={href === currentNavItem?.href}
      expanded={expanded}
      subitems={subitems}
      onClick={() => {
        reader.focusedBookTab?.display(href, false)
      }}
      toggle={() => reader.focusedBookTab?.toggle(id)}
      onActivate={onActivate}
    />
  )
}
