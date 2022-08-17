import { useColorScheme, useEventListener } from '@literal-ui/hooks'
import clsx from 'clsx'
import { Contents } from 'epubjs'
import React, {
  ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { MdChevronRight, MdWebAsset } from 'react-icons/md'
import { RiBookLine } from 'react-icons/ri'
import { PhotoSlider } from 'react-photo-view'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'

import { actionState, navbarState, settingsState } from '@ink/reader/state'

import { hasSelection, useLibrary, useMobile } from '../hooks'
import { Reader, BookTab } from '../models'
import { updateCustomStyle } from '../styles'

import { Tab } from './Tab'
import { TextSelectionMenu } from './TextSelectionMenu'
import { DropZone, SplitView, useDndContext } from './base'

export const reader = proxy(new Reader())

subscribe(reader, () => {
  console.log(snapshot(reader))
})

function handleKeyDown(tab?: BookTab) {
  return (e: KeyboardEvent) => {
    try {
      switch (e.code) {
        case 'ArrowLeft':
        case 'ArrowUp':
          tab?.prev()
          break
        case 'ArrowRight':
        case 'ArrowDown':
          tab?.next()
          break
        case 'Space':
          e.shiftKey ? tab?.prev() : tab?.next()
      }
    } catch (error) {
      // ignore `rendition is undefined` error
    }
  }
}

export function ReaderGridView() {
  const { groups } = useSnapshot(reader)

  useEventListener('keydown', handleKeyDown(reader.focusedBookTab))

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
  const books = useLibrary()

  const handleMouseDown = useCallback(() => {
    reader.selectGroup(index)
  }, [index])

  return (
    <div
      className="flex h-full flex-1 flex-col overflow-hidden focus:outline-none"
      onMouseDown={handleMouseDown}
    >
      <Tab.List
        className="hidden sm:flex"
        onDelete={() => reader.removeGroup(index)}
      >
        {tabs.map((tab, i) => {
          const selected = i === selectedIndex
          const focused = index === focusedIndex && selected
          return (
            <Tab
              key={tab.id}
              selected={selected}
              focused={focused}
              onClick={() => group.selectTab(i)}
              onDelete={() => reader.removeTab(i, index)}
              Icon={tab instanceof BookTab ? RiBookLine : MdWebAsset}
            >
              {tab.title}
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
              reader.addGroup([new BookTab(book)], index)
              break
            case 'right':
              reader.addGroup([new BookTab(book)], index + 1)
              break
            default:
              group.addTab(book)
          }
        }}
      >
        {group.tabs.map((tab, i) => (
          <PaneContainer active={i === selectedIndex} key={tab.id}>
            {tab instanceof BookTab ? (
              <BookPane tab={tab} focus={focus} onMouseDown={handleMouseDown} />
            ) : (
              <tab.Component />
            )}
          </PaneContainer>
        ))}
      </DropZone>
    </div>
  )
}

interface PaneContainerProps {
  active: boolean
}
export const PaneContainer: React.FC<PaneContainerProps> = ({
  active,
  children,
}) => {
  return <div className={clsx('h-full', active || 'hidden')}>{children}</div>
}

interface BookPaneProps {
  tab: BookTab
  focus: () => void
  onMouseDown: () => void
}

function BookPane({ tab, focus, onMouseDown }: BookPaneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const settings = useRecoilValue(settingsState)
  const { scheme } = useColorScheme()
  const {
    iframe,
    rendition,
    locationToReturn,
    results,
    location,
    percentage,
    definitions,
    rendered,
    currentHref,
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

  const setNavbar = useSetRecoilState(navbarState)
  const setAction = useSetRecoilState(actionState)
  const mobile = useMobile()

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
  }, [currentHref, underline])

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

  const [src, setSrc] = useState<string>()

  useEffect(() => {
    if (src) {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement?.blur()
    } else {
      focus()
    }
  }, [focus, src])

  const { setDragEvent } = useDndContext()

  // `dragenter` not fired in iframe when the count of times is even, so use `dragover`
  useEventListener(iframe, 'dragover', (e: any) => {
    console.log('drag enter in iframe')
    setDragEvent(e)
  })

  useEventListener(iframe, 'mousedown', onMouseDown)

  useEventListener(iframe, 'click', (e) => {
    // https://developer.chrome.com/blog/tap-to-search
    e.preventDefault()

    for (const el of e.composedPath() as any) {
      // `instanceof` may not work in iframe
      if (el.tagName === 'A' && el.href) {
        tab.showPrevLocation()
        return
      }
      if (mobile === false && el.tagName === 'IMG') {
        setSrc(el.src)
        return
      }
    }

    if (window.matchMedia('(max-width: 640px)').matches) {
      const w = window.innerWidth
      const x = e.offsetX % w
      const threshold = 0.3
      const side = w * threshold

      if (x < side) {
        tab.prev()
      } else if (w - x < side) {
        tab.next()
      } else {
        setNavbar((a) => !a)
      }
    }
  })

  useEventListener(iframe, 'wheel', (e) => {
    if (e.deltaY < 0) {
      tab.prev()
    } else {
      tab.next()
    }
    focus()
  })

  useEventListener(iframe, 'keydown', handleKeyDown(tab))

  useEventListener(iframe, 'touchstart', (e) => {
    const x0 = e.targetTouches[0]?.clientX ?? 0
    iframe?.addEventListener('touchend', function handleTouchEnd(e) {
      iframe.removeEventListener('touchend', handleTouchEnd)
      const selection = iframe.getSelection()
      if (hasSelection(selection)) return

      const x1 = e.changedTouches[0]?.clientX ?? 0
      const deltaX = x1 - x0
      if (deltaX > 0) tab.prev()
      if (deltaX < 0) tab.next()
    })
  })

  return (
    <div className={clsx('flex h-full flex-col', mobile && 'py-[3vw]')}>
      <PhotoSlider
        images={[{ src, key: 0 }]}
        visible={!!src}
        onClose={() => setSrc(undefined)}
        maskOpacity={0.6}
        bannerVisible={false}
      />
      <ReaderPaneHeader tab={tab} />
      <div ref={ref} className={clsx('relative flex-1', rendered || '-z-10')}>
        <TextSelectionMenu tab={tab} />
      </div>
      <Bar>
        <button
          className={clsx(locationToReturn || 'invisible')}
          onClick={() => {
            tab.hidePrevLocation()
            tab.display(locationToReturn?.end.cfi, false)
          }}
        >
          Return to {locationToReturn?.end.cfi}
        </button>

        {locationToReturn ? (
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
      </Bar>
    </div>
  )
}

interface ReaderPaneHeaderProps {
  tab: BookTab
}
export const ReaderPaneHeader: React.FC<ReaderPaneHeaderProps> = ({ tab }) => {
  const { location } = useSnapshot(tab)
  const breadcrumbs = tab.getNavPath()

  return (
    <Bar>
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
    </Bar>
  )
}

interface LineProps extends ComponentProps<'div'> {}
export const Bar: React.FC<LineProps> = ({ className, ...props }) => {
  return (
    <div
      className={clsx(
        'typescale-body-small text-outline flex h-6 items-center justify-between gap-2 px-[4vw] sm:px-2',
        className,
      )}
      {...props}
    ></div>
  )
}
