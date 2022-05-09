import { useColorScheme } from '@literal-ui/hooks'
import clsx from 'clsx'
import type Section from 'epubjs/types/section'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
      {groups.map(({ id }, i) => (
        <ReaderGroup key={id} index={i} />
      ))}
    </SplitView>
  )
}

interface ReaderGroupProps {
  index: number
}
function ReaderGroup({ index }: ReaderGroupProps) {
  const group = reader.groups[index]!
  const { focusedIndex } = useSnapshot(reader)
  const { tabs, selectedIndex } = useSnapshot(group)
  const selectedTab = group.tabs[selectedIndex]!
  const books = useLibrary()
  const ref = useRef<HTMLDivElement>(null)

  const focus = useCallback(() => {
    ref.current?.focus()
  }, [])

  useEffect(() => {
    focus()
  }, [focus])

  const { rendition } = selectedTab

  const prev = useCallback(() => {
    rendition?.prev()
    focus()
  }, [focus, rendition])

  const next = useCallback(() => {
    rendition?.next()
    focus()
  }, [focus, rendition])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      try {
        switch (e.code) {
          case 'ArrowLeft':
          case 'ArrowUp':
            prev()
            break
          case 'ArrowRight':
          case 'ArrowDown':
            next()
            break
          case 'Space':
            e.shiftKey ? prev() : next()
        }
      } catch (error) {
        // ignore `rendition is undefined` error
      }
    },
    [next, prev],
  )

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.deltaY < 0) {
        prev()
      } else {
        next()
      }
    },
    [next, prev],
  )

  const handleClick = useCallback(() => {
    reader.selectGroup(index)
  }, [index])

  return (
    <div
      ref={ref}
      className="flex h-full flex-1 flex-col overflow-hidden focus:outline-none"
      tabIndex={1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
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
        <ReaderPane
          tab={selectedTab}
          key={selectedTab.book.id}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
        />
      </DropZone>
    </div>
  )
}

interface ReaderPaneProps {
  tab: ReaderTab
  onClick: () => void
  onKeyDown: (e: React.KeyboardEvent | KeyboardEvent) => void
  onWheel: (e: WheelEvent) => void
}

export function ReaderPane({
  tab,
  onClick,
  onKeyDown,
  onWheel,
}: ReaderPaneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const settings = useRecoilValue(settingsState)
  const { scheme } = useColorScheme()
  const { rendition, prevLocation, results, location } = useSnapshot(tab)

  const result = results?.find((r) => r.id === location?.start.href)
  const matches = result?.subitems

  useEffect(() => {
    matches?.forEach((m) => {
      rendition?.annotations.highlight(m.cfi!)
    })
  }, [matches, rendition?.annotations])

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

  const [iframe, setIframe] = useState<Window>()

  useEffect(() => {
    rendition?.on('rendered', (_: Section, view: any) => {
      const iframe = view.window as Window
      setIframe(iframe)
    })
  }, [rendition])

  useEffect(() => {
    if (iframe)
      // `dragenter` not fired in iframe when the count of times is even, so use `dragover`
      iframe.ondragover = () => {
        console.log('drag enter in iframe')
        setDragover(true)
      }
  }, [iframe, setDragover])

  useEffect(() => {
    if (iframe)
      iframe.onclick = (e: any) => {
        // `instanceof` may not work in iframe
        if (e.path.find((el: HTMLElement) => el.tagName === 'A')) {
          tab.showPrevLocation()
        }
        onClick()
      }
  }, [iframe, onClick, tab])

  useEffect(() => {
    if (iframe) iframe.onwheel = onWheel
  }, [iframe, onWheel])

  useEffect(() => {
    if (iframe) iframe.onkeydown = onKeyDown
  }, [iframe, onKeyDown])

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
  const { nav, location } = useSnapshot(tab)
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
