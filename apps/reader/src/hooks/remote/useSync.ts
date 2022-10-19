import { useCallback, useEffect } from 'react'
import { useSnapshot } from 'valtio'

import { Annotation } from '@ink/reader/annotation'
import { BookRecord } from '@ink/reader/db'
import { BookTab } from '@ink/reader/models'
import { uploadData } from '@ink/reader/sync'

import { useRemoteBooks } from './useRemote'

export function useSync(tab: BookTab) {
  const { mutate } = useRemoteBooks()
  const { location, book } = useSnapshot(tab)

  const id = tab.book.id

  const sync = useCallback(
    async (changes: Partial<BookRecord>) => {
      // to remove effect dependency `remoteBooks`
      mutate(
        (remoteBooks) => {
          if (remoteBooks) {
            const i = remoteBooks.findIndex((b) => b.id === id)
            if (i < 0) return remoteBooks

            remoteBooks[i] = {
              ...remoteBooks[i]!,
              ...changes,
            }

            uploadData(remoteBooks)

            return [...remoteBooks]
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
      definitions: book.definitions as string[],
    })
  }, [book.definitions, sync])

  useEffect(() => {
    sync({
      annotations: book.annotations as Annotation[],
    })
  }, [book.annotations, sync])
}
