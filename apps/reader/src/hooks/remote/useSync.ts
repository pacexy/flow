import { useCallback, useEffect } from 'react'
import { useSnapshot } from 'valtio'

import { BookRecord } from '@ink/reader/db'
import { BookTab } from '@ink/reader/models'
import { dbx } from '@ink/reader/sync'

import { useRemoteBooks } from './useRemote'

export function useSync(tab: BookTab) {
  const { mutate } = useRemoteBooks()
  const { location, book, definitions } = useSnapshot(tab)

  const id = tab.book.id

  const sync = useCallback(
    async (changes: Partial<BookRecord>) => {
      // to remove effect dependency `remoteBooks`
      mutate(
        (remoteBooks) => {
          if (remoteBooks) {
            const i = remoteBooks.findIndex((b) => b.id === id)
            if (i < 0) return remoteBooks

            const newRemoteBooks = remoteBooks.splice(i, 1, {
              ...remoteBooks[i]!,
              ...changes,
            })

            dbx.filesUpload({
              path: '/books.json',
              mode: { '.tag': 'overwrite' },
              contents: JSON.stringify(newRemoteBooks),
            })

            return newRemoteBooks
          }
        },
        { revalidate: false },
      )
    },
    [id, mutate],
  )

  useEffect(() => {
    sync({
      cfi: location?.start.cfi,
      percentage: book.percentage,
    })
  }, [sync, book.percentage, location?.start.cfi])

  useEffect(() => {
    sync({
      definitions: definitions as string[],
    })
  }, [sync, definitions])
}
