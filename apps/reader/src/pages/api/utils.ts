import { PaddleSDK } from '@invertase/node-paddle-sdk'
import { PrismaClient } from '@prisma/client'
import { Dropbox } from 'dropbox'

export const paddle = new PaddleSDK(
  Number(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID),
  process.env.PADDLE_AUTH_CODE!,
  process.env.PADDLE_PUBLIC_KEY,
  'https://sandbox-vendors.paddle.com/api/2.0',
)

export const prisma = new PrismaClient()

export const dbx = new Dropbox({
  clientId: process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID,
  clientSecret: process.env.DROPBOX_CLIENT_SECRET,
})
