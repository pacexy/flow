import { useLiveQuery } from 'dexie-react-hooks'
import epub, { Book } from 'epubjs'
import React from 'react'

import { DropZone } from '../components'
import { db } from '../db'
import { useAsync } from '../hooks'

export default function Web() {
  return (
    <div>
      <DropZone className="p-4">
        <Library />
      </DropZone>
    </div>
  )
}

export const Library: React.FC = () => {
  const books = useLiveQuery(() => db?.books.toArray() ?? [])

  return (
    <ul className="flex flex-wrap gap-4">
      {books?.map(({ id, data, name }) => {
        const book = epub(data)

        return (
          <li key={id}>
            <div className="bg-outline/5 w-56 space-y-4 rounded p-4">
              <Cover book={book} />
              <div
                className="line-clamp-2 text-on-surface-variant typescale-body-large w-full"
                title={name}
              >
                {name}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

interface CoverProps {
  book: Book
}
export const Cover: React.FC<CoverProps> = ({ book }) => {
  const src = useAsync(() => book.coverUrl())

  return (
    <img
      src={src ?? undefined}
      alt="Cover"
      className="mx-auto h-56 object-contain"
    />
  )
}
