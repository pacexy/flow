import useSWR from 'swr/immutable'

import { BookRecord } from '@ink/reader/db'
import { readBlob } from '@ink/reader/file'
import { dbx } from '@ink/reader/sync'

import { useSubscription } from './useSubscription'

const dropboxFilesFetcher = (path: string) => {
  return dbx.filesListFolder({ path }).then((d) => d.result.entries)
}

const dropboxBooksFetcher = (path: string) => {
  return dbx
    .filesDownload({ path })
    .then((d) => {
      const blob: Blob = (d.result as any).fileBlob
      return readBlob((r) => r.readAsText(blob))
    })
    .then((d) => JSON.parse(d) as BookRecord[])
}

export function useRemoteFiles() {
  const subscription = useSubscription()

  return useSWR(
    subscription?.status === 'active' ? '/files' : null,
    dropboxFilesFetcher,
  )
}

export function useRemoteBooks() {
  const subscription = useSubscription()

  return useSWR(
    subscription?.status === 'active' ? '/books.json' : null,
    dropboxBooksFetcher,
  )
}
