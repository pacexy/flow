import { Link } from '@literal-ui/next'
import { useUser } from '@supabase/auth-helpers-react'
import Script from 'next/script'
import { ComponentProps } from 'react'

import { useSubscription } from '@ink/reader/hooks'

import { reader } from '../Reader'

import { Auth } from './auth'

const __IS_DEV__ = process.env.NODE_ENV === 'development'

export const Account: React.FC = () => {
  const { user } = useUser()

  if (!user) {
    reader.replaceTab(Auth)
    return null
  }

  return (
    <div>
      <Script
        src="https://cdn.paddle.com/paddle/paddle.js"
        onLoad={() => {
          if (__IS_DEV__) window.Paddle.Environment.set('sandbox')
          window.Paddle.Setup({
            vendor: Number(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID),
          })
        }}
      />
      <img
        src={user.user_metadata.avatar_url}
        alt="Avatar"
        className="h-10 rounded-full"
      />
      <Link href="/api/auth/logout">Sign out</Link>
      <Subscription />
    </div>
  )
}

enum Status {
  NONE = 0,
  ACTIVE = 1 << 0,
  PAUSED = 1 << 1,
}

export const Subscription: React.FC = () => {
  const { user } = useUser()
  const subscription = useSubscription()
  if (subscription === undefined) return null

  let status = Status.NONE
  if (subscription?.status === 'active') status |= Status.ACTIVE
  if (subscription?.paused_at) status |= Status.PAUSED

  const descriptionMap = {
    [Status.NONE]: 'Subscribe to sync your data',
    [Status.ACTIVE]: `Your subscription will automatically renew on ${subscription?.next_bill_date}`,
    [Status.ACTIVE |
    Status.PAUSED]: `Your subscription will end on ${subscription?.next_bill_date}`,
    [Status.PAUSED]: `Your subscription has expired on ${subscription?.next_bill_date}`,
  }

  let buttonProps: ComponentProps<'button'>

  if (status & Status.PAUSED) {
    buttonProps = {
      onClick: () => fetch('/api/subscription/restart'),
      children: 'Re-subscribe',
    }
  } else if (status & Status.ACTIVE) {
    buttonProps = {
      onClick: () => fetch('/api/subscription/pause'),
      children: 'Cancel',
    }
  } else {
    buttonProps = {
      onClick: () =>
        window.Paddle.Checkout.open({
          product: Number(process.env.NEXT_PUBLIC_PADDLE_PRODUCT_ID),
          email: user?.email,
          disableLogout: true,
        }),
      children: 'Subscribe',
    }
  }

  return (
    <div>
      <div>{descriptionMap[status]}</div>
      <button {...buttonProps} />
    </div>
  )
}

Account.displayName = 'Account'
