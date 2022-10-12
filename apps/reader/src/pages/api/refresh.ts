import { Dropbox } from 'dropbox'
import type { NextApiRequest, NextApiResponse } from 'next'

const dbx = new Dropbox({
  clientId: process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID,
  clientSecret: process.env.DROPBOX_CLIENT_SECRET,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = req.query.token
  if (typeof token !== 'string') return

  dbx.auth.setRefreshToken(token)
  await dbx.auth.refreshAccessToken()

  res.json({
    accessToken: dbx.auth.getAccessToken(),
    accessTokenExpiresAt: dbx.auth.getAccessTokenExpiresAt(),
  })
}
