import { PaddleSDK, PaddleWebhook } from '@invertase/node-paddle-sdk'
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const PADDLE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAxeB2iIV9oyBRMvrq7Mg9
wy/+KuzEq1WvZfoyIg/YMLXkS/PQENcEGewE9ArSGB+vDQN+jAlkKmGo7A5c5SFL
9Sp9dcDjJ7xsIcxWJaLbK3QgkW3n3PeQ10kR0eb/FMuddj0en1bDs61uUcAFK05o
ewhuVUbaT8wGFjMguZVB30TUge7c5xGckBbmlzstZl2pFgXOBhEvYKEoCcs1XvdX
fceeCTkk+pp81lGQVJXmTE/NSkPFha+ocI+EiGqrcHUimTN+jxUlVIf4H6B1qJYf
X0DbtUZMrNDhX0IWbRqBOSmAzPaIYPhLbeejFuaOPvyXAztvUn60u3x4cvd4KTmF
qAfME66Xm0QsnfaAhpy2ecgifQ40igoO8pb/zJ/RM35RvGFOJ2/vP/My4aCOXgD6
Lyyx3lKm/3VqImNVEgCVIKDw2ccYdi4q3zCqDxCYan3JyjHU/memUHOLV23B9w9D
gc7eWn0Rw5ag5aOqIiIoHw6aG/nEX5QXNtRD7DKNQBqYCwd1J9J1VZNWlpbdlqan
MPUqjjbCB+5uUm7hWQ2cu93MUEQy3HmsllWw/oTsVCMoa9p0QWR51JaiICFPgcVs
FltwBrR5LFbe1sV4/1+GUXtsNZKVFgn/p1OAncs+GQzws9ToJfqVjQ2/Iych3n/i
gI0UU4UlkXMiEZS95lafdKUCAwEAAQ==
-----END PUBLIC KEY-----`

const paddle = new PaddleSDK(
  Number(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID),
  process.env.PADDLE_API_KEY!,
  PADDLE_PUBLIC_KEY,
)

const prisma = new PrismaClient()

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
