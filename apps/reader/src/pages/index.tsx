import { useLiveQuery } from 'dexie-react-hooks'
import React from 'react'

import { DropZone } from '../components'
import { db } from '../db'

export default function Web() {
  return (
    <div>
      <DropZone>
        <Library />
      </DropZone>
    </div>
  )
}

export const Library: React.FC = () => {
  const books = useLiveQuery(() => db?.books.toArray() ?? [])

  return (
    <ul>
      {books?.map((book) => (
        <li key={book.id}>{book.name}</li>
      ))}
    </ul>
  )
}
