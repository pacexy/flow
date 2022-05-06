import { useColorScheme } from '@literal-ui/hooks'
import clsx from 'clsx'
import type Section from 'epubjs/types/section'
import { useEffect, useMemo, useRef } from 'react'
import { MdChevronRight } from 'react-icons/md'
import { useRecoilValue } from 'recoil'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'

import { settingsState } from '@ink/reader/state'

import { useLibrary } from '../hooks'
import { Reader, ReaderTab } from '../models'

import { Tab } from './Tab'
import { DropZone, SplitView, useDndContext } from './base'

export const reader = proxy(new Reader())

subscribe(reader, () => {
  console.log(snapshot(reader))
})

export function ReaderGridView() {
  const { groups } = useSnapshot(reader)
  if (!groups.length) return null
  return (
    <SplitView>
      {groups.map((_, i) => (
        <ReaderGroup key={i} index={i} />
      ))}
    </SplitView>
  )
}

interface ReaderGroupProps {
  index: number
}
function ReaderGroup({ index }: ReaderGroupProps) {
  const group = reader.groups[index]!
  const selectedTab = group.selectedTab!
  const { focusedIndex } = useSnapshot(reader)
  const { tabs, selectedIndex } = useSnapshot(group)
  const books = useLibrary()

  return (
    <div
      className="flex h-full flex-1 flex-col overflow-hidden"
      onClick={() => reader.selectGroup(index)}
    >
      <Tab.List onDelete={() => reader.removeGroup(index)}>
        {tabs.map(({ book }, i) => {
          const selected = i === selectedIndex
          const focused = index === focusedIndex && selected
          return (
            <Tab
              key={book.id}
              selected={selected}
              focused={focused}
              onClick={() => group.selectTab(i)}
              onDelete={() => reader.removeTab(i, index)}
            >
              {book.name}
            </Tab>
          )
        })}
      </Tab.List>

      <DropZone
        split
        onDrop={(e, position) => {
          const bookId = e.dataTransfer.getData('text/plain')
          const book = books?.find((b) => b.id === bookId)
          if (!book) return
          switch (position) {
            case 'left':
              reader.addGroup([new ReaderTab(book)], index)
              break
            case 'right':
              reader.addGroup([new ReaderTab(book)], index + 1)
              break
            default:
              reader.addTab(book)
          }
        }}
      >
        <ReaderPane tab={selectedTab} key={selectedTab.book.id} index={index} />
      </DropZone>
    </div>
  )
}

interface ReaderPaneProps {
  tab: ReaderTab
  index: number
}

export function ReaderPane({ tab, index }: ReaderPaneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const settings = useRecoilValue(settingsState)
  const { scheme } = useColorScheme()
  const { rendition, prevLocation } = useSnapshot(tab)

  useEffect(() => {
    if (ref.current) tab.render(ref.current)
    return () => {
      tab.rendition = undefined
    }
  }, [tab])

  useEffect(() => {
    rendition?.themes.override('font-size', settings.fontSize + 'px')
    rendition?.themes.override('font-weight', settings.fontWeight + '')
    rendition?.themes.override('line-height', settings.lineHeight + '')
    if (settings.fontFamily)
      rendition?.themes.override('font-family', settings.fontFamily)
  }, [rendition, settings])

  useEffect(() => {
    if (!scheme) return
    const dark = scheme === 'dark'
    rendition?.themes.override('color', dark ? '#bfc8ca' : '#3f484a')
    rendition?.themes.override('background', dark ? '#121212' : 'white')
  }, [rendition, scheme])

  const { setDragover } = useDndContext()

  useEffect(() => {
    rendition?.on('rendered', (section: Section) => {
      console.log(section)

      // @ts-ignore
      const [view] = rendition?.views()._views ?? []
      console.log(view)

      // `dragenter` not fired in iframe when the count of times is even, so use `dragover`
      view.window.ondragover = () => {
        console.log('drag enter in iframe')
        setDragover(true)
      }
      view.window.onclick = (e: any) => {
        // `instanceof` may not work in iframe
        if (e.path.find((el: HTMLElement) => el.tagName === 'A')) {
          tab.showPrevLocation()
        }

        reader.selectGroup(index)
      }
      view.window.onmousewheel = (e: WheelEvent) => {
        if (e.deltaY < 0) {
          rendition?.prev()
        } else {
          rendition?.next()
        }
      }
    })
  }, [index, rendition, setDragover, tab])

  return (
    <>
      <ReaderPaneHeader tab={tab} />
      <div ref={ref} className="scroll flex-1" />
      <div
        className={clsx(
          'typescale-body-small text-outline absolute inset-x-0 bottom-0 flex justify-between px-2',
          prevLocation || 'hidden',
        )}
      >
        <button
          onClick={() => {
            tab.hidePrevLocation()
            rendition?.display(prevLocation?.end.cfi)
          }}
        >
          Back
        </button>
        {prevLocation?.start.cfi}
        <button
          onClick={() => {
            tab.hidePrevLocation()
          }}
        >
          Stay
        </button>
      </div>
    </>
  )
}

interface ReaderPaneHeaderProps {
  tab: ReaderTab
}
export const ReaderPaneHeader: React.FC<ReaderPaneHeaderProps> = ({ tab }) => {
  const { nav, location } = tab
  const breadcrumbs = useMemo(() => {
    const crumbs = []
    let navItem = location && nav?.get(location?.start.href)

    while (navItem) {
      crumbs.unshift(navItem)
      const parentId = navItem.parent
      if (!parentId) {
        navItem = undefined
      } else {
        // @ts-ignore
        const index = nav.tocById[parentId]
        // @ts-ignore
        navItem = nav.getByIndex(parentId, index, nav.toc)
      }
    }
    return crumbs
  }, [location, nav])

  return (
    <div className="typescale-body-small text-outline flex h-6 select-none items-center justify-between gap-2 px-2">
      <div className="scroll-h flex">
        {breadcrumbs.map((item, i) => (
          <button
            key={i}
            className="hover:text-on-surface flex shrink-0 items-center"
          >
            {item.label}
            {i !== breadcrumbs.length - 1 && <MdChevronRight size={20} />}
          </button>
        ))}
      </div>
      {location && (
        <div className="shrink-0">
          {location.start.displayed.page} / {location.start.displayed.total}
        </div>
      )}
    </div>
  )
}
