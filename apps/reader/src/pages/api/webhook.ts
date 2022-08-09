import type { PaddleWebhook } from '@invertase/node-paddle-sdk'
import type { NextApiRequest, NextApiResponse } from 'next'

import { paddle, prisma } from './utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const verified = paddle.verifyWebhook(req.body)

  if (!verified) {
    return res.status(403).send('Invalid webhook request.')
  }

  const e = req.body as PaddleWebhook

  switch (e.alert_name) {
    case 'subscription_created': {
      await prisma.subscription.create({
        data: {
          cancel_url: e.cancel_url,
          checkout_id: e.checkout_id,
          currency: e.currency,
          email: e.email,
          marketing_consent: Number(e.marketing_consent),
          next_bill_date: e.next_bill_date,
          passthrough: e.passthrough,
          quantity: e.quantity,
          source: e.source,
          status: e.status as any,
          subscription_id: e.subscription_id,
          subscription_plan_id: e.subscription_plan_id,
          unit_price: e.unit_price,
          user_id: e.user_id,
          update_url: e.update_url,
        },
      })
      break
    }
    case 'subscription_updated': {
      await prisma.subscription.update({
        where: { subscription_id: e.subscription_id },
        data: {
          cancel_url: e.cancel_url,
          checkout_id: e.checkout_id,
          email: e.email,
          marketing_consent: Number(e.marketing_consent),
          quantity: e.new_quantity,
          unit_price: e.new_unit_price,
          next_bill_date: e.next_bill_date,
          currency: e.currency,
          passthrough: e.passthrough,
          status: e.status as any,
          subscription_id: e.subscription_id,
          subscription_plan_id: e.subscription_plan_id,
          user_id: e.user_id,
          paused_at: e.paused_at,
          paused_from: e.paused_from,
          paused_reason: e.paused_reason,
        },
      })
      break
    }
  }

  return res.end()
}
