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
import { useList } from 'react-use'

import { clamp } from '@ink/reader/utils'

export type Orientation = 'horizontal' | 'vertical'

interface ISplitViewItem {
  resize?: (size: number) => void
}
interface SplitViewContext {
  registerView(view?: ISplitViewItem): void
}
const SplitViewContext = createContext<Partial<SplitViewContext>>({})
SplitViewContext.displayName = 'SplitViewContext'

export function useSplitView() {
  return useContext(SplitViewContext)
}

export function useRegisterView(view?: ISplitViewItem) {
  const { registerView } = useSplitView()

  useEffect(() => {
    registerView?.(view)
  }, [registerView, view])
}

export function useWidth(
  preferredWidth: number,
  minWidth = 0,
  maxWidth = Number.POSITIVE_INFINITY,
) {
  const [width, setWidth] = useState(preferredWidth)
  const resize = useCallback(
    (width: number) => {
      setWidth(clamp(width, minWidth, maxWidth))
    },
    [maxWidth, minWidth],
  )
  return [width, resize] as const
}

export function useSplitViewItem(
  preferredWidth: number,
  minWidth = 0,
  maxWidth = Number.POSITIVE_INFINITY,
) {
  const [width, resize] = useWidth(preferredWidth, minWidth, maxWidth)
  useRegisterView(
    useMemo(
      () => ({
        resize: minWidth === maxWidth ? undefined : resize,
      }),
      [maxWidth, minWidth, resize],
    ),
  )
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
  const [views, { push }] = useList<ISplitViewItem>()
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className={clsx('SplitView relative h-full', className)}>
      <SplitViewContext.Provider value={{ registerView: push }}>
        <div className="SashContainer pointer-events-none absolute inset-0">
          {Children.toArray(children)
            .slice(1)
            .map((_, i) => {
              if (!ref.current) return null
              const el = ref.current.children.item(i + 1) as HTMLElement

              return (
                <Sash
                  key={i}
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
  element: HTMLElement
  disabled: boolean
  handleChange(delta: number): void
}
const Sash: React.FC<SashProps> = ({ element, disabled }) => {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const { left } = element.getBoundingClientRect()

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
        left: left - SASH_WIDTH / 2,
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
          e
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', function handleMouseUp() {
          setActive(false)
          window.removeEventListener('mousemove', handleMouseMove)
          window.removeEventListener('mouseup', handleMouseUp)
        })
      }}
    ></div>
  )
}
