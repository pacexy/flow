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
import { navbarState, useSettings } from '@flow/reader/state'

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
      {groups.map(({ id }: { id: string }, i: number) => (
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
        {tabs.map((tab: any, i: number) => {
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
        {group.tabs.map((tab: any, i: number) => (
          <PaneContainer active={i === selectedIndex} key={tab.id}>
            {tab instanceof BookTab ? (
              <BookPane
                tab={tab}
                onMouseDown={handleMouseDown}
                swipeThreshold={60}
              />
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
  swipeThreshold?: number
}

function BookPane({ tab, onMouseDown, swipeThreshold = 60 }: BookPaneProps) {
  // Constants for swipe behavior
  const SWIPE_DETECTION_THRESHOLD = 15
  const SWIPE_DAMPING_FACTOR = 0.4
  const MAX_SWIPE_OFFSET = 150
  const SWIPE_RESISTANCE_THRESHOLD = 0.7
  const SWIPE_TIME_LIMIT = 400
  const GRADIENT_WIDTH = 60

  const ref = useRef<HTMLDivElement>(null)
  const prevSize = useRef(0)
  const touchMoveHandlerRef = useRef<((e: TouchEvent) => void) | null>(null)
  const touchEndHandlerRef = useRef<((e: TouchEvent) => void) | null>(null)
  const touchStartStateRef = useRef<{
    startX: number
    startY: number
    startTime: number
    hasShownGradient: boolean
  } | null>(null)
  const typography = useTypography(tab)
  const { dark } = useColorScheme()
  const [background] = useBackground()
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(
    null,
  )
  const [showPageTurnGradient, setShowPageTurnGradient] = useState(false)
  const [settings] = useSettings()

  const { iframe, rendition, rendered, container } = useSnapshot(tab)

  // Helper function to generate theme-aware gradient
  const generateGradient = (direction: 'left' | 'right', isDark: boolean) => {
    const position = direction === 'right' ? 'left center' : 'right center'
    const opacity = isDark
      ? { start: 0.1, mid: 0.05 }
      : { start: 0.03, mid: 0.015 }

    return `radial-gradient(ellipse 120px 100% at ${position}, rgba(0,0,0,${opacity.start}) 0%, rgba(0,0,0,${opacity.mid}) 40%, transparent 70%)`
  }

  // Helper function to apply damping to swipe offset
  const applySwipeDamping = (deltaX: number) => {
    let dampedOffset = deltaX * SWIPE_DAMPING_FACTOR

    // Add resistance when approaching maximum offset
    if (
      Math.abs(dampedOffset) >
      MAX_SWIPE_OFFSET * SWIPE_RESISTANCE_THRESHOLD
    ) {
      const resistance = Math.abs(dampedOffset) / MAX_SWIPE_OFFSET
      dampedOffset = dampedOffset * (1 - resistance * 0.5)
    }

    // Clamp to maximum offset
    return Math.max(-MAX_SWIPE_OFFSET, Math.min(MAX_SWIPE_OFFSET, dampedOffset))
  }

  useTilg()

  // Memoized touch handlers to prevent recreation on every touchstart
  const touchMoveHandler = useCallback(
    (e: TouchEvent) => {
      const touchState = touchStartStateRef.current
      if (!touchState) return

      const currentX = e.touches[0]?.clientX ?? 0
      const currentY = e.touches[0]?.clientY ?? 0
      const deltaX = currentX - touchState.startX
      const deltaY = currentY - touchState.startY
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      // Only handle horizontal swipes above detection threshold
      if (absX > absY && absX > SWIPE_DETECTION_THRESHOLD) {
        e.preventDefault()
        setIsSwiping(true)

        // Apply damping for smooth movement
        const dampedOffset = applySwipeDamping(deltaX)
        setSwipeOffset(dampedOffset)

        // Determine swipe direction
        const direction = deltaX > 0 ? 'right' : 'left'
        setSwipeDirection(direction)

        // Show gradient when swipe threshold is met
        const shouldShowGradient = absX > absY && absX > swipeThreshold
        setShowPageTurnGradient(shouldShowGradient)

        // Track gradient state for page turn commitment
        if (shouldShowGradient) {
          touchState.hasShownGradient = true
        }
      }
    },
    [swipeThreshold],
  )

  const touchEndHandler = useCallback(
    (e: TouchEvent) => {
      const touchState = touchStartStateRef.current
      if (!touchState) return

      // Clean up event listeners
      if (touchMoveHandlerRef.current) {
        iframe?.removeEventListener('touchmove', touchMoveHandlerRef.current)
        touchMoveHandlerRef.current = null
      }
      if (touchEndHandlerRef.current) {
        iframe?.removeEventListener('touchend', touchEndHandlerRef.current)
        touchEndHandlerRef.current = null
      }

      const endX = e.changedTouches[0]?.clientX ?? 0
      const endY = e.changedTouches[0]?.clientY ?? 0
      const endTime = Date.now()

      const deltaX = endX - touchState.startX
      const deltaY = endY - touchState.startY
      const deltaTime = endTime - touchState.startTime
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      // Page turn logic: gradient shown OR fast swipe criteria met
      const fastSwipeCondition =
        absX > absY && absX > swipeThreshold && deltaTime < SWIPE_TIME_LIMIT
      const shouldTurnPage = touchState.hasShownGradient || fastSwipeCondition

      if (shouldTurnPage && absX > absY) {
        if (deltaX > 0) {
          tab.prev()
        } else {
          tab.next()
        }
      }

      // Reset swipe state
      setIsSwiping(false)
      setSwipeOffset(0)
      setSwipeDirection(null)
      setShowPageTurnGradient(false)

      // Clear touch state
      touchStartStateRef.current = null
    },
    [swipeThreshold, iframe, tab],
  )

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
      if (
        mobile === false &&
        el.tagName === 'IMG' &&
        el.src.startsWith('blob:')
      ) {
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

  useEventListener(iframe, 'touchstart', (e) => {
    // Early return if swipes are disabled
    if (!settings.swipeEnabled) return

    const startX = e.targetTouches[0]?.clientX ?? 0
    const startY = e.targetTouches[0]?.clientY ?? 0
    const startTime = Date.now()

    if (!iframe) return

    // Clean up any existing listeners before adding new ones
    if (touchMoveHandlerRef.current) {
      iframe.removeEventListener('touchmove', touchMoveHandlerRef.current)
      touchMoveHandlerRef.current = null
    }
    if (touchEndHandlerRef.current) {
      iframe.removeEventListener('touchend', touchEndHandlerRef.current)
      touchEndHandlerRef.current = null
    }

    // Store touch state in ref for the memoized handlers to access
    touchStartStateRef.current = {
      startX,
      startY,
      startTime,
      hasShownGradient: false,
    }

    // Store handlers in refs for cleanup
    touchMoveHandlerRef.current = touchMoveHandler
    touchEndHandlerRef.current = touchEndHandler
    iframe.addEventListener('touchmove', touchMoveHandler)
    iframe.addEventListener('touchend', touchEndHandler)
  })

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      if (iframe && touchMoveHandlerRef.current) {
        iframe.removeEventListener('touchmove', touchMoveHandlerRef.current)
        touchMoveHandlerRef.current = null
      }
      if (iframe && touchEndHandlerRef.current) {
        iframe.removeEventListener('touchend', touchEndHandlerRef.current)
        touchEndHandlerRef.current = null
      }
      // Clear touch state ref
      touchStartStateRef.current = null
    }
  }, [iframe])

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
        style={{
          colorScheme: 'auto',
          transform: isSwiping ? `translateX(${swipeOffset}px)` : undefined,
          transition: isSwiping
            ? 'none'
            : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        <div
          className={clsx(
            'absolute inset-0',
            'z-20',
            rendered && 'hidden',
            background,
          )}
        />

        {/* Page turn gradient - provides visual feedback for swipe threshold */}
        {showPageTurnGradient && swipeDirection && (
          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 z-30',
              'transition-opacity duration-150 ease-out',
              swipeDirection === 'right' ? 'left-0' : 'right-0',
            )}
            style={{
              width: `${GRADIENT_WIDTH}px`,
              background: generateGradient(swipeDirection, dark ?? false),
            }}
          />
        )}

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
