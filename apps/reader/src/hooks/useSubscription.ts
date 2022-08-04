import { Subscription } from '@prisma/client'
import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@supabase/auth-helpers-react'
import { useEffect } from 'react'
import { atom, useRecoilState } from 'recoil'

export const subscriptionState = atom<Subscription | undefined | null>({
  key: 'subscription',
  default: undefined,
})

export function useSubscription() {
  const { user } = useUser()
  const [subscription, setSubscription] = useRecoilState(subscriptionState)

  useEffect(() => {
    if (!user) return
    supabaseClient
      .from('Subscription')
      .select('*')
      .single()
      .then(({ data }) => {
        setSubscription(data ?? null)
      })
  }, [user])

  return subscription
}
