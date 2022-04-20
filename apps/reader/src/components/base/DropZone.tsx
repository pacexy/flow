import clsx from 'clsx'
import { useContext, useState, createContext } from 'react'

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

interface DropZoneInnerProps {}
const DropZoneInner: React.FC<DropZoneInnerProps> = ({ children }) => {
  const { dragover, setDragover } = useDndContext()
  console.log(dragover)
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

      {dragover && <div className="bg-outline/20 absolute inset-0 z-10"></div>}
      {dragover && (
        <div
          className="absolute inset-0 z-10"
          onDragOver={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
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
