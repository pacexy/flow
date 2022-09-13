import { BookRecord } from '@ink/reader/db'

import { useStorage } from './useStorage'
import { useSupabase } from './useSupabase'

export function useRemoteFiles() {
  return useStorage('books')
}

export function useRemoteBooks() {
  const { data } = useSupabase<BookRecord>('Book')
  return data
}
