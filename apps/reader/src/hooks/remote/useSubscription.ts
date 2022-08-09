import { Subscription } from '@prisma/client'
import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@supabase/auth-helpers-react'
import { useEffect } from 'react'
import { atom, useRecoilValue, useSetRecoilState } from 'recoil'

export const subscriptionState = atom<Subscription | undefined | null>({
  key: 'subscription',
  default: undefined,
})

export function useInitSubscription() {
  const { user } = useUser()
  const setSubscription = useSetRecoilState(subscriptionState)

  useEffect(() => {
    if (!user) return

    supabaseClient
      .from('Subscription')
      .select('*')
      .single()
      .then(({ data }) => {
        setSubscription(data ?? null)
      })

    supabaseClient
      .from('Subscription')
      .on('*', (payload) => {
        setSubscription(payload.new ?? null)
      })
      .subscribe()
  }, [setSubscription, user])
}

export function useSubscription() {
  return useRecoilValue(subscriptionState)
}
