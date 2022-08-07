import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import useSWRImmutable from 'swr/immutable'

import { useSubscription } from './useSubscription'

const fetcher = (table: string) => {
  return supabaseClient
    .from(table)
    .select('*')
    .then((r) => r.data) as any
}

export function useSupabase<T>(table: string) {
  const subscription = useSubscription()

  return useSWRImmutable<T[]>(
    subscription?.status === 'active' ? table : null,
    fetcher,
  )
}
