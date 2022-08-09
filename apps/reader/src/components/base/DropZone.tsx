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

import { reader } from '../Reader'

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

// > During the drag, in an event listener for the dragenter and dragover events, you use the data types of the data being dragged to check whether a drop is allowed.
// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#drag_data
function accept(e?: DragEvent) {
  const dt = e?.dataTransfer
  return !!dt?.types.every((t) => ['text/plain', 'Files'].includes(t))
}

const DropZoneInner: React.FC<DropZoneProps> = ({
  children,
  className,
  onDrop,
  split = false,
}) => {
  const { dragover, setDragEvent } = useDndContext()
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
      className={clsx('relative', className)}
      // https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#selecting_files_using_drag_and_drop
      onDragEnter={(e) => {
        console.log('drag enter', e.dataTransfer.types)
        if (dragover) return

        setDragEvent(e)
        e.stopPropagation()
        e.preventDefault()
      }}
    >
      {children}

      {dragover && (
        <div
          className={clsx(
            'bg-outline/20 absolute top-0 z-10',
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
            setDragEvent()
          }}
          onDrop={(e) => {
            console.log('drop', e)
            setDragEvent()
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
  setDragEvent: (e?: DragEvent) => void
}>({ dragover: false, setDragEvent: () => {} })
const DndProvider: React.FC = ({ children }) => {
  const [dragover, setDragover] = useState(false)

  const setDragEvent = useCallback((e?: DragEvent) => {
    setDragover(accept(e))
  }, [])

  return (
    <DndContext.Provider value={{ dragover, setDragEvent }}>
      {children}
    </DndContext.Provider>
  )
}

export function useDndContext() {
  return useContext(DndContext)
}

export async function handleFiles(files: Iterable<File>, open = false) {
  const books = await db?.books.toArray()

  for (const file of files) {
    console.log(file)
    if (file.type !== 'application/epub+zip') continue

    let book = books?.find((b) => b.name === file.name)

    if (!book) {
      book = {
        id: crypto.randomUUID(),
        name: file.name,
        createdAt: +new Date(),
        definitions: [],
      }
      db?.books.add(book)
      addFile(book.id, file)
    }

    if (open) reader.addTab(book)
  }
}

export function addFile(id: string, file: File) {
  db?.files.add({ id, file })
  window.requestIdleCallback(async () => {
    const data = await file.arrayBuffer()
    const epub = ePub(data)
    const url = await epub.coverUrl()
    const cover = await toDataUrl(url ?? '')
    db?.covers.add({ id, cover })
  })
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
