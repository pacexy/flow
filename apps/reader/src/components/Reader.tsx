import { StateLayer } from '@literal-ui/core'
import { useColorScheme } from '@literal-ui/hooks'
import clsx from 'clsx'
import type Section from 'epubjs/types/section'
import { useEffect, useMemo, useRef } from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { useRecoilValue } from 'recoil'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'

import { settingsState } from '@ink/reader/state'

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
  const { tabs, selectedIndex } = useSnapshot(group)

  return (
    <div className="flex h-full flex-col">
      <Tab.List>
        {tabs.map(({ book }, i) => {
          const selected = i === selectedIndex
          return (
            <Tab
              key={book.id}
              selected={selected}
              focused={selected}
              onClick={() => group.selectTab(i)}
              onDelete={() => reader.removeTab(i)}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', book.id)
              }}
              draggable
            >
              {book.name}
            </Tab>
          )
        })}
      </Tab.List>

      <DropZone>
        <ReaderPane tab={selectedTab} key={selectedTab.book.id} />
      </DropZone>
    </div>
  )
}

interface NavButtonProps {
  dir: 'left' | 'right'
  tab: ReaderTab
}
const NavButton: React.FC<NavButtonProps> = ({ dir, tab }) => {
  const left = dir === 'left'
  const Icon = left ? MdChevronLeft : MdChevronRight
  return (
    <button
      className={clsx('relative flex flex-1 items-center justify-center')}
      onClick={() => (left ? tab.rendition?.prev() : tab.rendition?.next())}
    >
      <StateLayer />
      <Icon size={40} className="text-outline/30" />
    </button>
  )
}

interface ReaderPaneProps {
  tab: ReaderTab
}

export function ReaderPane({ tab }: ReaderPaneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const settings = useRecoilValue(settingsState)
  const { scheme } = useColorScheme()
  const { rendition } = useSnapshot(tab)

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
    })
  }, [rendition, setDragover])

  return (
    <>
      <ReaderPaneHeader tab={tab} />
      <div ref={ref} className="scroll flex-1" />
      <div className="flex">
        <NavButton dir="left" tab={tab} />
        <NavButton dir="right" tab={tab} />
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
    <div className="typescale-body-small text-outline flex h-6 select-none items-center justify-between px-2">
      <div className="flex">
        {breadcrumbs.map((item, i) => (
          <button key={i} className="hover:text-on-surface flex items-center">
            {item.label}
            {i !== breadcrumbs.length - 1 && <MdChevronRight size={20} />}
          </button>
        ))}
      </div>
      {location && (
        <div>
          {location.start.displayed.page} / {location.start.displayed.total}
        </div>
      )}
    </div>
  )
}
