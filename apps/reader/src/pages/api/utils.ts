import { PaddleSDK } from '@invertase/node-paddle-sdk'
import { PrismaClient } from '@prisma/client'

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

export const paddle = new PaddleSDK(
  Number(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID),
  process.env.PADDLE_API_KEY!,
  PADDLE_PUBLIC_KEY,
  'https://sandbox-vendors.paddle.com/api/2.0',
)

export const prisma = new PrismaClient()
