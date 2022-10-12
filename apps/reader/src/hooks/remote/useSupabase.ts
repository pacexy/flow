import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import useSWR from 'swr'

const fetcher = (table: string) => {
  return supabaseClient
    .from(table)
    .select('*')
    .then((r) => r.data) as any
}

export function useSupabase<T>(table: string) {
  return useSWR<T[]>(table, fetcher)
}
