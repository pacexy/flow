import { withSentry } from '@sentry/nextjs'
import { handleAuth } from '@supabase/auth-helpers-nextjs'

export default withSentry(
  handleAuth({
    logout: { returnTo: '/' },
    cookieOptions: { lifetime: 1 * 365 * 24 * 60 * 60 }, // Keep the user logged in for a year.
  }),
)
