import { withSentry } from '@sentry/nextjs'
import { withApiAuth, getUser } from '@supabase/auth-helpers-nextjs'

import { paddle, prisma } from '../utils'

export default withSentry(
  withApiAuth(async function ProtectedRoute(req, res) {
    const { action } = req.query
    const { user } = await getUser({ req, res })

    const subscription = await prisma.subscription.findFirst({
      where: { email: user.email },
    })

    if (subscription) {
      const pause = action === 'pause'

      // @ts-ignore
      await paddle.updateUser({
        subscription_id: Number(subscription.subscription_id),
        pause,
      })

      if (!pause) {
        await prisma.subscription.update({
          where: { email: user.email },
          data: {
            paused_at: null,
            paused_from: null,
            paused_reason: null,
          },
        })
      }
    }

    res.end()
  }),
)
