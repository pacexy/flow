import { Link } from '@literal-ui/next'
import { useUser } from '@supabase/auth-helpers-react'
import Script from 'next/script'

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
      <button
        onClick={() =>
          window.Paddle.Checkout.open({
            product: Number(process.env.NEXT_PUBLIC_PADDLE_PRODUCT_ID),
            email: user.email,
            disableLogout: true,
            upsell: 299946,
          })
        }
      >
        Upgrade
      </button>
      <br />
      <Link href="/api/auth/logout">Sign out</Link>
    </div>
  )
}

Account.displayName = 'Account'
