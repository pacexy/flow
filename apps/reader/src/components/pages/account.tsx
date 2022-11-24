import { Link } from '@literal-ui/next'
import { useUser } from '@supabase/auth-helpers-react'
import clsx from 'clsx'
import Script from 'next/script'

import { useSubscription } from '@flow/reader/hooks'

import { Button, ButtonProps } from '../Button'
import { Page } from '../Page'

const __IS_DEV__ = process.env.NODE_ENV === 'development'

export const Account: React.FC = () => {
  const { user } = useUser()

  if (!user) return null

  return (
    <Page headline="Account">
      <Script
        src="https://cdn.paddle.com/paddle/paddle.js"
        onLoad={() => {
          if (__IS_DEV__) window.Paddle.Environment.set('sandbox')
          window.Paddle.Setup({
            vendor: Number(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID),
          })
        }}
      />
      <div className="mb-4 flex gap-4">
        <div className="text-on-surface space-y-2">
          <div>{user.email}</div>
          <Link
            className="typescale-body-small text-outline"
            href="/api/auth/logout"
          >
            Sign out
          </Link>
        </div>
      </div>
      <Subscription />
    </Page>
  )
}

Account.displayName = 'Account'

enum Status {
  NONE = 0,
  ACTIVE = 1 << 0,
  PAUSED = 1 << 1,
}

const Subscription: React.FC = () => {
  const { user } = useUser()
  const subscription = useSubscription()
  if (subscription === undefined) return null

  let status = Status.NONE
  const active = subscription?.status === 'active'
  if (active) status |= Status.ACTIVE
  if (subscription?.paused_at) status |= Status.PAUSED

  const descriptionMap = {
    [Status.NONE]: 'Subscribe to sync your data',
    [Status.ACTIVE]: `Your subscription will automatically renew on ${subscription?.next_bill_date}`,
    [Status.ACTIVE |
    Status.PAUSED]: `Your subscription will end on ${subscription?.next_bill_date}`,
    [Status.PAUSED]: `Your subscription has expired on ${subscription?.next_bill_date}`,
  }

  let buttonProps: ButtonProps

  if (status & Status.PAUSED) {
    buttonProps = {
      onClick: () => fetch('/api/subscription/restart'),
      children: 'Re-subscribe',
    }
  } else if (status & Status.ACTIVE) {
    buttonProps = {
      onClick: () => fetch('/api/subscription/pause'),
      children: 'Cancel',
      variant: 'secondary',
    }
  } else {
    buttonProps = {
      onClick: () => {
        return
        window.Paddle.Checkout.open({
          product: Number(process.env.NEXT_PUBLIC_PADDLE_PRODUCT_ID),
          email: user?.email,
          disableLogout: true,
        })
      },
      children: 'Subscribe',
      disabled: true,
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <h2 className="typescale-title-medium text-on-surface-variant">
          Subscription
        </h2>
        <span
          className={clsx(
            'typescale-label-medium px-1 py-0.5',
            active
              ? 'bg-green-400/20 text-green-600 dark:text-green-300'
              : 'bg-outline/20 text-on-surface-variant',
          )}
        >
          {active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <Link
        href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/pricing`}
        className="typescale-body-small text-on-surface"
      >
        Detail
      </Link>

      <div className="typescale-body-small text-outline my-1">
        {descriptionMap[status]}
      </div>
      <Button {...buttonProps} />
    </div>
  )
}
