import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import useSWR from 'swr'

import { useSubscription } from './useSubscription'

const fetcher = (bucket: string, path: string) => {
  return supabaseClient.storage
    .from(bucket)
    .list(path)
    .then((r) => r.data)
}

export function useStorage(bucket: string) {
  const subscription = useSubscription()

  return useSWR(
    [subscription?.status === 'active' ? bucket : null, subscription?.email],
    fetcher,
  )
}
