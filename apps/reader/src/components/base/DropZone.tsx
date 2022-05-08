import clsx from 'clsx'
import ePub from 'epubjs'
import {
  useContext,
  useState,
  createContext,
  DragEvent,
  useCallback,
  useEffect,
} from 'react'

import { db } from '@ink/reader/db'

interface DropZoneProps {
  className?: string
  onDrop?: (e: DragEvent<HTMLDivElement>, position?: Position) => void
  split?: boolean
}
export const DropZone: React.FC<DropZoneProps> = (props) => {
  return (
    <DndProvider>
      <DropZoneInner {...props} />
    </DndProvider>
  )
}

type Position = 'universe' | 'left' | 'right' | 'top' | 'bottom'

const DropZoneInner: React.FC<DropZoneProps> = ({
  children,
  className,
  onDrop,
  split = false,
}) => {
  const { dragover, setDragover } = useDndContext()
  const [position, setPosition] = useState<Position>()
  // console.log(dragover, position)

  useEffect(() => {
    if (!dragover) setPosition(undefined)
  }, [dragover])

  const handleDragover = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.stopPropagation()
      e.preventDefault()

      setPosition(() => {
        if (!split) return 'universe'

        const rect = (e.target as HTMLDivElement).getBoundingClientRect()
        if (!rect.width || !rect.height) return

        const offsetLeft = (e.clientX - rect.left) / rect.width
        const offsetTop = (e.clientY - rect.top) / rect.height
        const offsetRight = 1 - offsetLeft
        const offsetBottom = 1 - offsetTop
        const threshold = 0.15

        // TODO: add `offsetTop` and `offsetBottom`
        const minOffset = Math.min(offsetLeft, offsetRight)

        if (minOffset > threshold) return 'universe'
        if (minOffset === offsetLeft) return 'left'
        if (minOffset === offsetRight) return 'right'
        if (minOffset === offsetTop) return 'top'
        if (minOffset === offsetBottom) return 'bottom'
      })
    },
    [split],
  )

  return (
    <div
      className={clsx('scroll-parent relative h-full', className)}
      // https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#selecting_files_using_drag_and_drop
      onDragEnter={(e) => {
        if (dragover) return
        console.log('drag enter', e.target)
        setDragover(true)
        e.stopPropagation()
        e.preventDefault()
      }}
    >
      {children}

      {dragover && (
        <div
          className={clsx(
            'bg-outline/20 absolute z-10 transition-all',
            position === 'left' && 'h-full w-1/2',
            position === 'right' && 'h-full w-1/2 translate-x-full',
            position === 'top' && 'h-1/2 w-full',
            position === 'bottom' && 'h-1/2  w-full translate-y-full',
            position === 'universe' && 'h-full w-full',
          )}
        ></div>
      )}
      {dragover && (
        <div
          className="absolute inset-0 z-10"
          onDragOver={handleDragover}
          onDragLeave={(e) => {
            console.log('drag leave', e.target)
            setDragover(false)
          }}
          onDrop={(e) => {
            console.log('drop', e)
            setDragover(false)
            e.stopPropagation()
            e.preventDefault()
            onDrop?.(e, position)
            handleFiles(e.dataTransfer.files)
          }}
        ></div>
      )}
    </div>
  )
}

const DndContext = createContext<{
  dragover: boolean
  setDragover: (dragover: boolean) => void
}>({ dragover: false, setDragover: () => {} })
const DndProvider: React.FC = ({ children }) => {
  const [dragover, setDragover] = useState(false)
  return (
    <DndContext.Provider value={{ dragover, setDragover }}>
      {children}
    </DndContext.Provider>
  )
}

export function useDndContext() {
  return useContext(DndContext)
}

export function handleFiles(files: FileList) {
  for (const file of files) {
    console.log(file)
    if (file.type !== 'application/epub+zip') continue

    const reader = new FileReader()

    reader.addEventListener('progress', ({ loaded, total }) => {
      if (loaded && total) {
        const percent = (loaded / total) * 100
        console.log(`Progress: ${Math.round(percent)}`)
      }
    })

    reader.addEventListener('load', async () => {
      if (!(reader.result instanceof ArrayBuffer)) return
      const epub = ePub(reader.result)

      const url = (await epub.coverUrl()) ?? ''
      const cover = await toDataUrl(url)

      db?.books.add({
        id: crypto.randomUUID(),
        name: file.name,
        data: reader.result,
        createdAt: +new Date(),
        cover,
      })
    })

    reader.readAsArrayBuffer(file)
  }
}

async function toDataUrl(url: string) {
  const res = await fetch(url)
  const buffer = await res.blob()

  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      resolve(reader.result as string)
    })
    reader.readAsDataURL(buffer)
  })
}
