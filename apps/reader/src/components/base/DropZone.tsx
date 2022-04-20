import clsx from 'clsx'
import { useContext, useState, createContext, DragEvent } from 'react'
import { useCallback } from 'react'

import { db } from '@ink/reader/db'

export const str = 'Hello world'

interface DropZoneProps {}
export const DropZone: React.FC<DropZoneProps> = (props) => {
  return (
    <DndProvider>
      <DropZoneInner {...props} />
    </DndProvider>
  )
}

enum Position {
  Universe,
  Top,
  Bottom,
  Left,
  Right,
}

interface DropZoneInnerProps {}
const DropZoneInner: React.FC<DropZoneInnerProps> = ({ children }) => {
  const { dragover, setDragover } = useDndContext()
  const [position, setPosition] = useState<Position>()
  console.log(dragover)
  console.log(position)

  const handleDragover = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()

    const rect = (e.target as HTMLDivElement).getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const offsetLeft = (e.clientX - rect.left) / rect.width
    const offsetTop = (e.clientY - rect.top) / rect.height
    const offsetRight = 1 - offsetLeft
    const offsetBottom = 1 - offsetTop
    const threshold = 0.15

    const minOffset = Math.min(offsetLeft, offsetRight, offsetTop, offsetBottom)

    setPosition(() => {
      if (minOffset > threshold) return Position.Universe
      if (minOffset === offsetLeft) return Position.Left
      if (minOffset === offsetRight) return Position.Right
      if (minOffset === offsetTop) return Position.Top
      if (minOffset === offsetBottom) return Position.Bottom
    })
  }, [])

  return (
    <div
      className={clsx('scroll-parent relative h-full')}
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
            position === Position.Left && 'h-full w-1/2',
            position === Position.Right && 'h-full w-1/2 translate-x-full',
            position === Position.Top && 'h-1/2 w-full',
            position === Position.Bottom && 'h-1/2  w-full translate-y-full',
            position === Position.Universe && 'h-full w-full',
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
            setDragover(false)
            e.stopPropagation()
            e.preventDefault()

            const dt = e.dataTransfer
            handleFiles(dt.files)
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

function handleFiles(files: FileList) {
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

    reader.addEventListener('load', () => {
      if (!(reader.result instanceof ArrayBuffer)) return
      db?.books.add({
        id: crypto.randomUUID(),
        name: file.name,
        data: reader.result,
        createdAt: +new Date(),
      })
    })

    reader.readAsArrayBuffer(file)
  }
}
