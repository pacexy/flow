import { useLiveQuery } from 'dexie-react-hooks'
import epub, { Book } from 'epubjs'
import React, { ComponentProps } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import { DropZone, Reader } from '../components'
import { db } from '../db'
import { useAsync } from '../hooks'
import { readerState } from '../state'

export default function Index() {
  const id = useRecoilValue(readerState)
  return (
    <div>
      {id ? (
        <Reader id={id} />
      ) : (
        <DropZone className="p-4">
          <Library />
        </DropZone>
      )}
    </div>
  )
}

export const Library: React.FC = () => {
  const books = useLiveQuery(() => db?.books.toArray() ?? [])
  const setId = useSetRecoilState(readerState)

  return (
    <ul className="flex flex-wrap gap-4">
      {books?.map(({ id, data, name }) => {
        const book = epub(data)

        return (
          <li key={id}>
            <div className="bg-outline/5 w-56 space-y-4 rounded p-4">
              <Cover role="button" book={book} onClick={() => setId(id)} />
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

interface CoverProps extends ComponentProps<'img'> {
  book: Book
}
export const Cover: React.FC<CoverProps> = ({ book, ...props }) => {
  const src = useAsync(() => book.coverUrl())

  return (
    <img
      src={src ?? undefined}
      alt="Cover"
      className="mx-auto h-56 object-contain"
      {...props}
    />
  )
}
