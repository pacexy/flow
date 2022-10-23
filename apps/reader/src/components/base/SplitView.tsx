import { Overlay } from '@literal-ui/core'
import { Maybe } from '@literal-ui/hooks'
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

interface ISplitViewItem {
  key: string
  visible?: boolean
  resize?: (size: number) => void
}
interface SplitViewContext {
  registerView(key: string, view: ISplitViewItem): void
}
const SplitViewContext = createContext<Partial<SplitViewContext>>({})
SplitViewContext.displayName = 'SplitViewContext'

function useSplitView() {
  return useContext(SplitViewContext)
}

function useRegisterView(key: string, view: ISplitViewItem) {
  const { registerView } = useSplitView()

  useEffect(() => {
    registerView?.(key, view)
  }, [key, registerView, view])
}

function useSize(
  preferredSize?: number,
  minSize = 0,
  maxSize = Number.POSITIVE_INFINITY,
) {
  const [size, setSize] = useState(preferredSize)
  const resize = useCallback(
    (delta: number) => {
      setSize((size) => size && clamp(size + delta, minSize, maxSize))
    },
    [maxSize, minSize],
  )
  return [size, resize] as const
}

export function useSplitViewItem(
  key: React.FC | string,
  {
    preferredSize,
    minSize = 0,
    maxSize = Number.POSITIVE_INFINITY,
    visible = true,
  }: {
    preferredSize?: number
    minSize?: number
    maxSize?: number
    visible?: boolean
  } = {},
) {
  const [size, _resize] = useSize(preferredSize, minSize, maxSize)
  const resize = minSize === maxSize ? undefined : _resize
  const stringKey = typeof key === 'string' ? key : key.name
  const view = useMemo(
    () => ({
      key: stringKey,
      resize,
      visible,
    }),
    [stringKey, resize, visible],
  )
  useRegisterView(stringKey, view)

  return { size }
}

interface SplitViewProps extends ComponentProps<'div'> {
  vertical?: boolean
}

export const SplitView = ({
  children,
  className,
  vertical = false,
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
        <div
          className={clsx(
            'SplitViewContainer flex h-full',
            vertical && 'flex-col',
          )}
        >
          {Children.toArray(children).reduce((a, c, i) => {
            return (
              <>
                {a}
                <Sash vertical={vertical} views={[views[i - 1], views[i]]} />
                {c}
              </>
            )
          })}
        </div>
      </SplitViewContext.Provider>
    </div>
  )
}

const SASH_SIZE = 4
interface SashProps {
  vertical: boolean
  views: Maybe<ISplitViewItem>[]
}
const Sash: React.FC<SashProps> = ({ vertical, views }) => {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)

  const enabled = views.every((v) => v?.visible && v?.resize)

  return (
    <div
      className={clsx(
        'sash relative z-30 hidden shrink-0 sm:block',
        enabled
          ? vertical
            ? 'cursor-ns-resize'
            : 'cursor-ew-resize'
          : 'pointer-events-none',
      )}
      style={{
        [vertical ? 'height' : 'width']: SASH_SIZE,
        [vertical ? 'marginBlock' : 'marginInline']: -SASH_SIZE / 2,
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
          const delta = vertical ? e.movementY : e.movementX
          views.forEach((v, i) => {
            v?.resize?.(delta * (-1) ** i)
          })
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', function handleMouseUp() {
          // `mouseleave` not fire when `mousedown`
          setHover(false)
          setActive(false)
          window.removeEventListener('mousemove', handleMouseMove)
          window.removeEventListener('mouseup', handleMouseUp)
        })
      }}
    >
      <div
        className={clsx(
          'border-surface-variant pointer-events-none absolute inset-0 transition-[background-color]',
          vertical
            ? 'top-1/2 -translate-y-1/2 border-b'
            : 'left-1/2 -translate-x-1/2 border-r',
          (hover || active) && 'bg-primary h-full w-full border-none',
        )}
      ></div>
      {active && <Overlay className="!bg-transparent" />}
    </div>
  )
}
