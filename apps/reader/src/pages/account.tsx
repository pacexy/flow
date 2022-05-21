import { Link } from '@literal-ui/next'
import { User, withPageAuth } from '@supabase/supabase-auth-helpers/nextjs'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

interface Props {
  user: User
}

export const getServerSideProps: GetServerSideProps<Props> = withPageAuth({
  redirectTo: '/auth',
})

export default function Account({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log(user)

  return (
    <div>
      <img
        src={user.user_metadata.avatar_url}
        alt="Avatar"
        className="h-10 rounded-full"
      />
      <Link href="/api/auth/logout">Sign out</Link>
    </div>
  )
}
