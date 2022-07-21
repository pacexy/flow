import { Link } from '@literal-ui/next'
import { useUser } from '@supabase/supabase-auth-helpers/react'

import { reader } from '../Reader'

import { Auth } from './auth'

export const Account: React.FC = () => {
  const { user } = useUser()

  if (!user) {
    reader.replaceTab(Auth)
    return null
  }

  return (
    <div>
      <img
        src={user.user_metadata.avatar_url}
        alt="Avatar"
        className="h-10 rounded-full"
      />
      <Link href="/api/auth/logout">Sign out</Link>
    </div>
  )
}

Account.displayName = 'Account'
