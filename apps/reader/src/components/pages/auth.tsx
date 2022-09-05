import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import { ComponentProps, useEffect, useRef, useState } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { RiGithubFill } from 'react-icons/ri'

import { Button } from '../Button'
import { TextField } from '../TextField'

export const Auth: React.FC = () => {
  const ref = useRef<HTMLInputElement>(null)
  const [sent, setSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown === 0) return
    setTimeout(() => {
      setCountdown((cd) => cd - 1)
    }, 1000)
  }, [countdown])

  return (
    <div className="mx-auto mt-10 flex w-56 flex-col items-stretch gap-2">
      <Provider provider="google" />
      <Provider provider="github" />

      <div className="text-surface-variant divider">or</div>

      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          supabaseClient.auth
            .signIn({ email: ref.current?.value })
            .then(({ error }) => {
              if (error) return
              setSent(true)
              setCountdown(60)
            })
        }}
      >
        <TextField mRef={ref} name="email" type="email" required />
        <Button type="submit" className="w-full" disabled={!!countdown}>
          {countdown || 'Continue'}
        </Button>
      </form>
      {sent && (
        <div className="text-outline typescale-body-small text-center">
          {`We've emailed you a link to log in.`}
        </div>
      )}
    </div>
  )
}

Auth.displayName = 'Auth'

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const iconMap = {
  google: <FcGoogle size={20} />,
  github: <RiGithubFill size={20} />,
}
interface ButtonProps extends ComponentProps<'button'> {
  provider: 'github' | 'google'
}
const Provider: React.FC<ButtonProps> = ({ provider, ...props }) => {
  return (
    <Button
      className="flex items-center justify-center gap-2"
      onClick={() => supabaseClient.auth.signIn({ provider })}
      variant="secondary"
      {...props}
    >
      {iconMap[provider]}
      Continue with {capitalize(provider)}
    </Button>
  )
}
