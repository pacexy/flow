import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import useSWRImmutable from 'swr/immutable'

import { useSubscription } from './useSubscription'

const fetcher = (bucket: string, path: string) => {
  return supabaseClient.storage
    .from(bucket)
    .list(path)
    .then((r) => r.data)
}

export function useStorage(bucket: string) {
  const subscription = useSubscription()

  return useSWRImmutable(
    [subscription?.status === 'active' ? bucket : null, subscription?.email],
    fetcher,
  )
}
