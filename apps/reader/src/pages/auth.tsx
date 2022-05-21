import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useUser } from '@supabase/supabase-auth-helpers/react'
import { useRouter } from 'next/router'
import { ComponentProps, useEffect } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { RiGithubFill } from 'react-icons/ri'

export default function Auth() {
  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    if (user) router.push('/account')
  }, [router, user])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <Provider provider="google" />
      <Provider provider="github" />
    </div>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const iconMap = {
  google: <FcGoogle size={20} />,
  github: <RiGithubFill size={20} fill="#454545" />,
}
interface ButtonProps extends ComponentProps<'button'> {
  provider: 'github' | 'google'
}
export const Provider: React.FC<ButtonProps> = ({ provider, ...props }) => {
  return (
    <button
      className="bg-surface1 text-on-surface typescale-body-medium flex items-center gap-2 p-2"
      onClick={() => {
        supabaseClient.auth.signIn(
          { provider },
          { redirectTo: `${location.origin}/auth` },
        )
      }}
      {...props}
    >
      {iconMap[provider]}
      Login with {capitalize(provider)}
    </button>
  )
}
