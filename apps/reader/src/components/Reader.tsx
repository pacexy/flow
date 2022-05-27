import { useColorScheme } from '@literal-ui/hooks'
import clsx from 'clsx'
import { Contents } from 'epubjs'
import type Section from 'epubjs/types/section'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MdChevronRight } from 'react-icons/md'
import { PhotoSlider } from 'react-photo-view'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'

import { actionState, settingsState } from '@ink/reader/state'

import { useLibrary } from '../hooks'
import { Reader, ReaderTab } from '../models'
import { updateCustomStyle } from '../styles'

import { Tab } from './Tab'
import { TextSelectionMenu } from './TextSelectionMenu'
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

function markFlashed(tab = reader.focusedTab) {
  if (tab?.location?.start.displayed.page === 1) {
    tab.hasFlashed = false
  }
}

interface ReaderGroupProps {
  index: number
}
function ReaderGroup({ index }: ReaderGroupProps) {
  const group = reader.groups[index]!
  const { focusedIndex, focusedTab } = useSnapshot(reader)
  const { tabs, selectedIndex } = useSnapshot(group)
  const books = useLibrary()
  const ref = useRef<HTMLDivElement>(null)

  const focus = useCallback(() => {
    ref.current?.focus()
  }, [])

  useEffect(() => {
    focus()
  }, [focus])

  const rendition = focusedTab?.rendition

  const prev = useCallback(() => {
    rendition?.prev()
    focus()
    markFlashed()
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

  const handleMouseDown = useCallback(() => {
    reader.selectGroup(index)
  }, [index])

  return (
    <div
      ref={ref}
      className="flex h-full flex-1 flex-col overflow-hidden focus:outline-none"
      tabIndex={1}
      onMouseDown={handleMouseDown}
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
        className="flex-1"
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
              group.addTab(book)
          }
        }}
      >
        {group.tabs.map((tab, i) => (
          <ReaderPane
            tab={tab}
            key={tab.book.id}
            active={i === selectedIndex}
            focus={focus}
            onMouseDown={handleMouseDown}
            onKeyDown={handleKeyDown}
          />
        ))}
      </DropZone>
    </div>
  )
}

interface ReaderPaneProps {
  tab: ReaderTab
  active: boolean
  focus: () => void
  onMouseDown: () => void
  onKeyDown: (e: React.KeyboardEvent | KeyboardEvent) => void
}

export function ReaderPane({
  tab,
  active,
  focus,
  onMouseDown,
  onKeyDown,
}: ReaderPaneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const settings = useRecoilValue(settingsState)
  const { scheme } = useColorScheme()
  const {
    rendition,
    prevLocation,
    results,
    location,
    percentage,
    definitions,
    hasFlashed,
  } = useSnapshot(tab)

  useEffect(() => {
    const result = results?.find((r) => r.id === location?.start.href)
    const matches = result?.subitems
    matches?.forEach((m) => {
      try {
        rendition?.annotations.highlight(
          m.cfi!,
          undefined,
          undefined,
          undefined,
          {
            fill: 'rgba(255, 223, 93, 0.3)',
            'fill-opacity': 'unset',
          },
        )
      } catch (error) {
        // ignore matched text in `<title>`
      }
    })

    return () => {
      matches?.forEach((m) => {
        rendition?.annotations.remove(m.cfi!, 'highlight')
      })
    }
  }, [location?.start.href, rendition?.annotations, results, settings])

  const setAction = useSetRecoilState(actionState)

  const underline = useCallback(
    async (def: string, type: 'add' | 'remove') => {
      const result = await tab.searchInSection(def)
      result?.subitems?.forEach((m) => {
        try {
          if (type === 'remove') {
            rendition?.annotations.remove(m.cfi!, 'underline')
          } else {
            rendition?.annotations.underline(
              m.cfi!,
              undefined,
              () => {
                setAction('Search')
                tab.setKeyword(def)
              },
              undefined,
              {
                stroke: '',
                'stroke-opacity': 1,
              },
            )
          }
        } catch (error) {
          console.log(error, def, m)
          // ignore matched text in `<title>`
        }
      })
    },
    [rendition?.annotations, setAction, tab],
  )

  useEffect(() => {
    definitions?.forEach((d) => underline(d, 'add'))
    return () => {
      definitions?.forEach((d) => underline(d, 'remove'))
    }
    // re-run when section changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.start.href, underline])

  useEffect(() => {
    tab.onAddDefinition = (d) => underline(d, 'add')
    tab.onRemoveDefinition = (d) => underline(d, 'remove')
  }, [tab, underline])

  useEffect(() => {
    if (ref.current) tab.render(ref.current)
    return () => {
      tab.rendition = undefined
    }
  }, [tab])

  useEffect(() => {
    const [contents] = (rendition?.getContents() ?? []) as unknown as Contents[]
    updateCustomStyle(contents, settings)
  }, [rendition, settings])

  useEffect(() => {
    if (!scheme) return
    const dark = scheme === 'dark'
    rendition?.themes.override('color', dark ? '#bfc8ca' : '#3f484a')
    rendition?.themes.override('background', dark ? '#121212' : 'white')
  }, [rendition, scheme])

  const { setDragEvent } = useDndContext()

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
      iframe.ondragover = (e: any) => {
        console.log('drag enter in iframe')
        setDragEvent(e)
      }
  }, [iframe, setDragEvent])

  const [src, setSrc] = useState<string>()

  useEffect(() => {
    if (src) {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement?.blur()
    } else {
      focus()
    }
  }, [focus, src])

  useEffect(() => {
    if (!iframe) return
    iframe.onmousedown = onMouseDown
  }, [iframe, onMouseDown, tab])

  useEffect(() => {
    if (!iframe) return
    iframe.onclick = (e: any) => {
      for (const el of e.path) {
        // `instanceof` may not work in iframe
        if (el.tagName === 'A') {
          tab.showPrevLocation()
          break
        }

        if (el.tagName === 'IMG') {
          setSrc(el.src)
          break
        }
      }
    }
  }, [iframe, tab])

  useEffect(() => {
    if (iframe)
      iframe.onwheel = (e: WheelEvent) => {
        if (e.deltaY < 0) {
          rendition?.prev()
          markFlashed(tab)
        } else {
          rendition?.next()
        }
        focus()
      }
  }, [focus, iframe, rendition, tab])

  useEffect(() => {
    if (iframe) iframe.onkeydown = onKeyDown
  }, [iframe, onKeyDown])

  return (
    <div className={clsx('h-full flex-col', active ? 'flex' : 'hidden')}>
      <PhotoSlider
        images={[{ src, key: 0 }]}
        visible={!!src}
        onClose={() => setSrc(undefined)}
        maskOpacity={0.6}
        bannerVisible={false}
      />
      <ReaderPaneHeader tab={tab} />
      <div ref={ref} className={clsx('relative flex-1', hasFlashed || '-z-10')}>
        <TextSelectionMenu tab={tab} />
      </div>
      <div className="typescale-body-small text-outline flex h-6 items-center justify-between px-2">
        <button
          className={clsx(prevLocation || 'invisible')}
          onClick={() => {
            tab.hidePrevLocation()
            rendition?.display(prevLocation?.end.cfi)
          }}
        >
          Return to {prevLocation?.end.cfi}
        </button>

        {prevLocation ? (
          <button
            onClick={() => {
              tab.hidePrevLocation()
            }}
          >
            Stay
          </button>
        ) : (
          <div>{(percentage * 100).toFixed()}%</div>
        )}
      </div>
    </div>
  )
}

interface ReaderPaneHeaderProps {
  tab: ReaderTab
}
export const ReaderPaneHeader: React.FC<ReaderPaneHeaderProps> = ({ tab }) => {
  const { location } = useSnapshot(tab)
  const breadcrumbs = tab.getNavPath()

  return (
    <div className="typescale-body-small text-outline flex h-6 items-center justify-between gap-2 px-2">
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
