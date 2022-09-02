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
  useState,
} from 'react'

import { clamp } from '@ink/reader/utils'

import { reader } from '../Reader'

export type Orientation = 'horizontal' | 'vertical'

interface ISplitViewItem {
  preferredWidth: number
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
  key: React.FC | string,
  {
    preferredWidth = Number.POSITIVE_INFINITY,
    minWidth = 0,
    maxWidth = Number.POSITIVE_INFINITY,
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
      preferredWidth,
      resize,
      visible,
    }),
    [preferredWidth, resize, visible],
  )
  useRegisterView(typeof key === 'string' ? key : key.name, view)

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

  const registerView = useCallback((key: string, view: ISplitViewItem) => {
    setViewMap((map) => {
      map.set(key, view)
      return new Map(map)
    })
  }, [])

  return (
    <div className={clsx('SplitView relative h-full', className)}>
      <SplitViewContext.Provider value={{ registerView }}>
        <div className="SplitViewContainer flex h-full">
          {Children.toArray(children).reduce((a, c, i) => {
            return (
              <>
                {a}
                <Sash
                  views={[views[i - 1]!, views[i]!]}
                  disabled={!views[i - 1]?.resize}
                  handleChange={() => {}}
                />
                {c}
              </>
            )
          })}
        </div>
      </SplitViewContext.Provider>
    </div>
  )
}

const SASH_WIDTH = 4
interface SashProps {
  views: [ISplitViewItem, ISplitViewItem]
  disabled: boolean
  handleChange(delta: number): void
}
const Sash: React.FC<SashProps> = ({ views, disabled }) => {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)

  return (
    <div
      className={clsx(
        'sash relative z-30',
        hover && 'hover',
        active && 'active',
        disabled ? 'pointer-events-none' : 'cursor-ew-resize',
      )}
      style={{
        width: SASH_WIDTH,
        marginInline: -SASH_WIDTH / 2,
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
