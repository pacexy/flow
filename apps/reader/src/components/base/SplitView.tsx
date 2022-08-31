import { Overlay } from '@literal-ui/core'
import clsx from 'clsx'
import {
  Children,
  ComponentProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useForceRender } from '@ink/reader/hooks'
import { clamp } from '@ink/reader/utils'

import { reader } from '../Reader'

export type Orientation = 'horizontal' | 'vertical'

interface ISplitViewItem {
  visible?: boolean
  resize?: (size: number) => void
}
interface SplitViewContext {
  registerView(key: string, view: ISplitViewItem): void
}
const SplitViewContext = createContext<Partial<SplitViewContext>>({})
SplitViewContext.displayName = 'SplitViewContext'

export function useSplitView() {
  return useContext(SplitViewContext)
}

export function useRegisterView(key: string, view: ISplitViewItem) {
  const { registerView } = useSplitView()

  useEffect(() => {
    registerView?.(key, view)
  }, [key, registerView, view])
}

export function useWidth(
  preferredWidth = Number.POSITIVE_INFINITY,
  minWidth = 0,
  maxWidth = Number.POSITIVE_INFINITY,
) {
  const [width, setWidth] = useState(preferredWidth)
  const resize = useCallback(
    (delta: number) => {
      setWidth((width) => clamp(width + delta, minWidth, maxWidth))
    },
    [maxWidth, minWidth],
  )
  return [width, resize] as const
}

export function useSplitViewItem(
  fn: React.FC,
  {
    preferredWidth,
    minWidth,
    maxWidth,
    visible = true,
  }: {
    preferredWidth?: number
    minWidth?: number
    maxWidth?: number
    visible?: boolean
  } = {},
) {
  const [width, _resize] = useWidth(preferredWidth, minWidth, maxWidth)
  const resize = minWidth === maxWidth ? undefined : _resize
  const view = useMemo(
    () => ({
      resize,
      visible,
    }),
    [resize, visible],
  )
  useRegisterView(fn.name, view)

  return { width }
}

interface SplitViewProps extends ComponentProps<'div'> {
  orientation?: Orientation
}

export const SplitView = ({
  children,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  orientation = 'horizontal',
}: SplitViewProps) => {
  const [viewMap, setViewMap] = useState(new Map<string, ISplitViewItem>())
  const views = [...viewMap.values()]
  const ref = useRef<HTMLDivElement>(null)

  const registerView = useCallback((key: string, view: ISplitViewItem) => {
    setViewMap((map) => {
      map.set(key, view)
      return new Map(map)
    })
  }, [])

  return (
    <div className={clsx('SplitView relative h-full', className)}>
      <SplitViewContext.Provider value={{ registerView }}>
        <div className="SashContainer pointer-events-none absolute inset-0">
          {Children.toArray(children)
            .slice(1)
            .map((_, i) => {
              if (!ref.current) return null
              if (!views[i]?.visible || !views[i + 1]?.visible) return null
              const el = ref.current.children.item(i + 1) as HTMLElement

              return (
                <Sash
                  key={i}
                  views={[views[i]!, views[i + 1]!]}
                  element={el}
                  disabled={!views[i]?.resize}
                  handleChange={() => {}}
                />
              )
            })}
        </div>
        <div ref={ref} className="SplitViewContainer flex h-full">
          {children}
        </div>
      </SplitViewContext.Provider>
    </div>
  )
}

const SASH_WIDTH = 4
interface SashProps {
  views: [ISplitViewItem, ISplitViewItem]
  element: HTMLElement
  disabled: boolean
  handleChange(delta: number): void
}
const Sash: React.FC<SashProps> = ({ views, element, disabled }) => {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const forceRender = useForceRender()
  const rect = element.getBoundingClientRect()

  return (
    <div
      className={clsx(
        'sash absolute inset-y-0 z-30',
        hover && 'hover',
        active && 'active',
        disabled || 'pointer-events-auto cursor-ew-resize',
      )}
      style={{
        width: SASH_WIDTH,
        left: rect.left - SASH_WIDTH / 2,
      }}
      onMouseEnter={() => {
        setHover(true)
      }}
      onMouseLeave={() => {
        setHover(false)
      }}
      onMouseDown={() => {
        setActive(true)

        function handleMouseMove(e: MouseEvent) {
          forceRender()
          views.forEach((v, i) => {
            v.resize?.(e.movementX * (-1) ** i)
          })
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', function handleMouseUp() {
          setActive(false)
          reader.resize()
          window.removeEventListener('mousemove', handleMouseMove)
          window.removeEventListener('mouseup', handleMouseUp)
        })
      }}
    >
      {active && <Overlay className="!bg-transparent" />}
    </div>
  )
}
