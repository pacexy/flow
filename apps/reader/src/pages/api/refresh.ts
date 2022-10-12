import type { NextApiRequest, NextApiResponse } from 'next'

import { dbx } from './utils'

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
