import useSWR from 'swr/immutable'

import {
  DATA_FILENAME,
  dropboxBooksFetcher,
  dropboxFilesFetcher,
} from '@ink/reader/sync'

import { isSubscriptionActive, useSubscription } from './useSubscription'

export function useRemoteFiles() {
  const subscription = useSubscription()

  return useSWR(
    isSubscriptionActive(subscription) ? '/files' : null,
    dropboxFilesFetcher,
    { shouldRetryOnError: false },
  )
}

export function useRemoteBooks() {
  const subscription = useSubscription()

  return useSWR(
    isSubscriptionActive(subscription) ? `/${DATA_FILENAME}` : null,
    dropboxBooksFetcher,
    { shouldRetryOnError: false },
  )
}
