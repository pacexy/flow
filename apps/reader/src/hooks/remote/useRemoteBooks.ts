import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'
import { atom, useRecoilValue, useSetRecoilState } from 'recoil'

import { BookRecord } from '@ink/reader/db'

import { useSubscription } from './useSubscription'

const remoteBooksState = atom<BookRecord[] | undefined | null>({
  key: 'remote.books',
  default: undefined,
})

export function useInitRemoteBooks() {
  const setRemoteBooks = useSetRecoilState(remoteBooksState)
  const subscription = useSubscription()

  useEffect(() => {
    if (subscription?.status !== 'active') return

    supabaseClient
      .from('Book')
      .select('*')
      .then(({ data }) => {
        setRemoteBooks(data)
      })
  }, [setRemoteBooks, subscription])
}

export function useRemoteBooks() {
  return useRecoilValue(remoteBooksState)
}
