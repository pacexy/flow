import { useEventListener } from '@literal-ui/hooks'
import clsx from 'clsx'
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
import { useSetRecoilState } from 'recoil'
import useTilg from 'tilg'
import { useSnapshot } from 'valtio'

import { RenditionSpread } from '@flow/epubjs/types/rendition'
import { navbarState } from '@flow/reader/state'

import { db } from '../db'
import { handleFiles } from '../file'
import {
  useBackground,
  useColorScheme,
  useDisablePinchZooming,
  useMobile,
  useSync,
  useTranslation,
  useTypography,
  useTouchEvent,
} from '../hooks'
import { BookTab, reader, useReaderSnapshot } from '../models'
import { isTouchScreen } from '../platform'
import { updateCustomStyle } from '../styles'

import {
  getClickedAnnotation,
  setClickedAnnotation,
  Annotations,
} from './Annotation'
import { Tab } from './Tab'
import { TextSelectionMenu } from './TextSelectionMenu'
import { DropZone, SplitView, useDndContext, useSplitViewItem } from './base'
import * as pages from './pages'

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
  const { groups } = useReaderSnapshot()

  useEventListener('keydown', handleKeyDown(reader.focusedBookTab))

  if (!groups.length) return null
  return (
    <SplitView className={clsx('ReaderGridView')}>
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
  const { focusedIndex } = useReaderSnapshot()
  const { tabs, selectedIndex } = useSnapshot(group)
  const t = useTranslation()

  const { size } = useSplitViewItem(`${ReaderGroup.name}.${index}`, {
    // to disable sash resize
    visible: false,
  })

  const handleMouseDown = useCallback(() => {
    reader.selectGroup(index)
  }, [index])

  return (
    <div
      className="ReaderGroup flex flex-1 flex-col overflow-hidden focus:outline-none"
      onMouseDown={handleMouseDown}
      style={{ width: size }}
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
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', `${index},${i}`)
              }}
            >
              {tab.isBook ? tab.title : t(`${tab.title}.title`)}
            </Tab>
          )
        })}
      </Tab.List>

      <DropZone
        className={clsx('flex-1', isTouchScreen || 'h-0')}
        split
        onDrop={async (e, position) => {
          // read `e.dataTransfer` first to avoid get empty value after `await`
          const files = e.dataTransfer.files
          let tabs = []

          if (files.length) {
            tabs = await handleFiles(files)
          } else {
            const text = e.dataTransfer.getData('text/plain')
            const fromTab = text.includes(',')

            if (fromTab) {
              const indexes = text.split(',')
              const groupIdx = Number(indexes[0])

              if (index === groupIdx) {
                if (group.tabs.length === 1) return
                if (position === 'universe') return
              }

              const tabIdx = Number(indexes[1])
              const tab = reader.removeTab(tabIdx, groupIdx)
              if (tab) tabs.push(tab)
            } else {
              const id = text
              const tabParam =
                Object.values(pages).find((p) => p.displayName === id) ??
                (await db?.books.get(id))
              if (tabParam) tabs.push(tabParam)
            }
          }

          if (tabs.length) {
            switch (position) {
              case 'left':
                reader.addGroup(tabs, index)
                break
              case 'right':
                reader.addGroup(tabs, index + 1)
                break
              default:
                tabs.forEach((t) => reader.addTab(t, index))
            }
          }
        }}
      >
        {group.tabs.map((tab, i) => (
          <PaneContainer active={i === selectedIndex} key={tab.id}>
            {tab instanceof BookTab ? (
              <BookPane tab={tab} onMouseDown={handleMouseDown} />
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
const PaneContainer: React.FC<PaneContainerProps> = ({ active, children }) => {
  return <div className={clsx('h-full', active || 'hidden')}>{children}</div>
}

interface BookPaneProps {
  tab: BookTab
  onMouseDown: () => void
}

function BookPane({ tab, onMouseDown }: BookPaneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prevSize = useRef(0)
  const typography = useTypography(tab)
  const { dark } = useColorScheme()
  const [background] = useBackground()

  const { iframe, rendition, rendered, container } = useSnapshot(tab)

  useTilg()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver(([e]) => {
      const size = e?.contentRect.width ?? 0
      // `display: hidden` will lead `rect` to 0
      if (size !== 0 && prevSize.current !== 0) {
        reader.resize()
      }
      prevSize.current = size
    })

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [])

  useSync(tab)

  const setNavbar = useSetRecoilState(navbarState)
  const mobile = useMobile()

  const applyCustomStyle = useCallback(() => {
    const contents = rendition?.getContents()[0]
    updateCustomStyle(contents, typography)
  }, [rendition, typography])

  useEffect(() => {
    tab.onRender = applyCustomStyle
  }, [applyCustomStyle, tab])

  useEffect(() => {
    if (ref.current) tab.render(ref.current)
  }, [tab])

  useEffect(() => {
    /**
     * when `spread` changes, we should call `spread()` to re-layout,
     * then call {@link updateCustomStyle} to update custom style
     * according to the latest layout
     */
    rendition?.spread(typography.spread ?? RenditionSpread.Auto)
  }, [typography.spread, rendition])

  useEffect(() => applyCustomStyle(), [applyCustomStyle])

  useEffect(() => {
    if (dark === undefined) return
    // set `!important` when in dark mode
    rendition?.themes.override('color', dark ? '#bfc8ca' : '#3f484a', dark)
  }, [rendition, dark])

  const [src, setSrc] = useState<string>()

  useEffect(() => {
    if (src) {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement?.blur()
    }
  }, [src])

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

    if (isTouchScreen && container) {
      if (getClickedAnnotation()) {
        setClickedAnnotation(false)
        return
      }

      const w = container.clientWidth
      const x = e.clientX % w
      const threshold = 0.3
      const side = w * threshold

      if (x < side) {
        tab.prev()
      } else if (w - x < side) {
        tab.next()
      } else if (mobile) {
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
  })

  useEventListener(iframe, 'keydown', handleKeyDown(tab))

  useTouchEvent({iframe, tab});

  useDisablePinchZooming(iframe)

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
      <div
        ref={ref}
        className={clsx('relative flex-1', isTouchScreen || 'h-0')}
        // `color-scheme: dark` will make iframe background white
        style={{ colorScheme: 'auto' }}
      >
        <div
          className={clsx(
            'absolute inset-0',
            // do not cover `sash`
            'z-20',
            rendered && 'hidden',
            background,
          )}
        />
        <TextSelectionMenu tab={tab} />
        <Annotations tab={tab} />
      </div>
      <ReaderPaneFooter tab={tab} />
    </div>
  )
}

interface ReaderPaneHeaderProps {
  tab: BookTab
}
const ReaderPaneHeader: React.FC<ReaderPaneHeaderProps> = ({ tab }) => {
  const { location } = useSnapshot(tab)
  const navPath = tab.getNavPath()

  useEffect(() => {
    navPath.forEach((i) => (i.expanded = true))
  }, [navPath])

  return (
    <Bar>
      <div className="scroll-h flex">
        {navPath.map((item, i) => (
          <button
            key={i}
            className="hover:text-on-surface flex shrink-0 items-center"
          >
            {item.label}
            {i !== navPath.length - 1 && <MdChevronRight size={20} />}
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

interface FooterProps {
  tab: BookTab
}
const ReaderPaneFooter: React.FC<FooterProps> = ({ tab }) => {
  const { locationToReturn, location, book } = useSnapshot(tab)

  return (
    <Bar>
      {locationToReturn ? (
        <>
          <button
            className={clsx(locationToReturn || 'invisible')}
            onClick={() => {
              tab.hidePrevLocation()
              tab.display(locationToReturn.end.cfi, false)
            }}
          >
            Return to {locationToReturn.end.cfi}
          </button>
          <button
            onClick={() => {
              tab.hidePrevLocation()
            }}
          >
            Stay
          </button>
        </>
      ) : (
        <>
          <div>{location?.start.href}</div>
          <div>{((book.percentage ?? 0) * 100).toFixed()}%</div>
        </>
      )}
    </Bar>
  )
}

interface LineProps extends ComponentProps<'div'> {}
const Bar: React.FC<LineProps> = ({ className, ...props }) => {
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
