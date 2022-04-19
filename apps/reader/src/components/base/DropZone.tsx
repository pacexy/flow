import clsx from 'clsx'
import { useState } from 'react'

import { db } from '@ink/reader/db'

export const str = 'Hello world'

interface DropZoneProps {}
export const DropZone: React.FC<DropZoneProps> = ({ children }) => {
  const [dragover, setDragover] = useState(false)
  return (
    <>
      <div
        className={clsx('absolute inset-0', dragover && 'bg-outline/10 z-10')}
      ></div>
      <div
        className={clsx('absolute inset-0', dragover && 'z-10')}
        // https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#selecting_files_using_drag_and_drop
        onDragEnter={(e) => {
          console.log('drag enter')
          setDragover(true)
          e.stopPropagation()
          e.preventDefault()
        }}
        onDragOver={(e) => {
          console.log('drag over')
          e.stopPropagation()
          e.preventDefault()
        }}
        onDragLeave={() => {
          console.log('drag leave')
          setDragover(false)
        }}
        onDrop={(e) => {
          console.log('drop')
          setDragover(false)
          e.stopPropagation()
          e.preventDefault()

          const dt = e.dataTransfer
          handleFiles(dt.files)
        }}
      ></div>
      {children}
    </>
  )
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
