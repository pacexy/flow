import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '../db'

export function useLibrary() {
  return useLiveQuery(() => db?.books.toArray() ?? [])
}
