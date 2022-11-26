import useSWR from 'swr/immutable'

import {
  DATA_FILENAME,
  dropboxBooksFetcher,
  dropboxFilesFetcher,
} from '@flow/reader/sync'

export function useRemoteFiles() {
  return useSWR('/files', dropboxFilesFetcher, { shouldRetryOnError: false })
}

export function useRemoteBooks() {
  return useSWR(`/${DATA_FILENAME}`, dropboxBooksFetcher, {
    shouldRetryOnError: false,
  })
}
