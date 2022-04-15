import clsx from 'clsx'
import { ComponentProps } from 'react'
import { useDropzone } from 'react-dropzone'

import { db } from '@ink/reader/db'

interface DropZoneProps extends ComponentProps<'div'> {}
export const DropZone: React.FC<DropZoneProps> = ({ children, className }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: [
      'application/epub+zip',
      // 'application/pdf'
    ],
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
          if (!(reader.result instanceof ArrayBuffer)) return
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { role, tabIndex, ...rootProps } = getRootProps()

  return (
    <div
      {...rootProps}
      className={clsx(
        'absolute inset-0',
        isDragActive && 'bg-gray-400/10',
        className,
      )}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  )
}
