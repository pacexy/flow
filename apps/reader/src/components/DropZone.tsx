import clsx from 'clsx'
import { useDropzone } from 'react-dropzone'

import { db } from '../db'

interface DropZoneProps {}
export const DropZone: React.FC<DropZoneProps> = ({ children }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    onDrop(files) {
      files.forEach((file) => {
        console.log(file)
        const reader = new FileReader()

        reader.addEventListener('progress', ({ loaded, total }) => {
          if (loaded && total) {
            const percent = (loaded / total) * 100
            console.log(`Progress: ${Math.round(percent)}`)
          }
        })

        reader.addEventListener('load', () => {
          db?.books.add({
            id: crypto.randomUUID(),
            name: file.name,
            data: reader.result,
            createdAt: +new Date(),
          })
        })

        reader.readAsArrayBuffer(file)
      })
    },
  })

  return (
    <div
      {...getRootProps()}
      role=""
      className={clsx('absolute inset-0', isDragActive && 'bg-gray-400/10')}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  )
}
