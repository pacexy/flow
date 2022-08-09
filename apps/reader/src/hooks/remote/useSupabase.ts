import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import useSWR from 'swr'

import { useSubscription } from './useSubscription'

const fetcher = (table: string) => {
  return supabaseClient
    .from(table)
    .select('*')
    .then((r) => r.data) as any
}

export function useSupabase<T>(table: string) {
  const subscription = useSubscription()

  return useSWR<T[]>(subscription?.status === 'active' ? table : null, fetcher)
}
