import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import { useCallback, useEffect } from 'react'
import { snapshot, useSnapshot } from 'valtio'

import { BookRecord } from '@ink/reader/db'
import { BookTab } from '@ink/reader/models'

import { useRemoteBooks } from './useRemote'

export function useSync(tab: BookTab) {
  const remoteBooks = useRemoteBooks()
  const { location, book, definitions } = useSnapshot(tab)

  const id = tab.book.id

  const sync = useCallback(
    async (changes: Partial<BookRecord>) => {
      console.log(changes)
      if (remoteBooks?.find((b) => b.id === id)) {
        await supabaseClient.from('Book').update(changes).eq('id', id)
      }
    },
    [remoteBooks, id],
  )

  useEffect(() => {
    sync({
      cfi: location?.start.cfi,
      percentage: book.percentage,
    })
  }, [sync, book.percentage, location?.start.cfi])

  useEffect(() => {
    sync({
      definitions: snapshot(definitions) as string[],
    })
  }, [sync, definitions])
}
