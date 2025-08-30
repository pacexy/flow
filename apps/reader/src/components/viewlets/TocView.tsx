import { StateLayer } from '@literal-ui/core'
import { useMemo, useReducer } from 'react'
import { VscCollapseAll, VscExpandAll } from 'react-icons/vsc'

import {
  useLibrary,
  useList,
  useMobile,
  useTranslation,
} from '@flow/reader/hooks'
import {
  compareHref,
  dfs,
  flatTree,
  INavItem,
  reader,
  useReaderSnapshot,
} from '@flow/reader/models'

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
  const toc = focusedBookTab?.nav?.toc as INavItem[] | undefined
  const expandedState = focusedBookTab?.tocExpandedState ?? {}
  const rows = useMemo(
    () => toc?.flatMap((i) => flatTree(i, 1, expandedState)),
    [toc, expandedState],
  )
  const expanded = Object.values(
    focusedBookTab?.tocExpandedState ?? {},
  ).some((v) => v)
  const currentNavItem = focusedBookTab?.currentNavItem

  const { outerRef, innerRef, items, scrollToItem } = useList(rows)
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

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
                currentNavItem={currentNavItem as INavItem}
                item={item}
                onActivate={() => scrollToItem(index)}
                forceUpdatePane={forceUpdate}
              />
            )
          })}
        </div>
      )}
    </Pane>
  )
}

interface TocRowProps {
  currentNavItem?: INavItem
  item?: INavItem
  onActivate: () => void
  forceUpdatePane: () => void
}
const TocRow: React.FC<TocRowProps> = ({
  currentNavItem,
  item,
  onActivate,
  forceUpdatePane,
}) => {
  const { focusedBookTab } = useReaderSnapshot()
  if (!item) return null
  const { label, subitems, depth, id, href } = item
  const expanded = focusedBookTab?.tocExpandedState[id]

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
      // `tab` can not be proxy here
      toggle={() => {
        reader.focusedBookTab?.toggle(id)
        forceUpdatePane()
      }}
      onActivate={onActivate}
    />
  )
}
