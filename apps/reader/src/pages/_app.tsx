import './styles.css'
import 'react-photo-view/dist/react-photo-view.css'

import { LiteralProvider } from '@literal-ui/core'
import { ErrorBoundary } from '@sentry/nextjs'
import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import { UserProvider } from '@supabase/auth-helpers-react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { RecoilRoot } from 'recoil'
import { SWRDevTools } from 'swr-devtools'

import { Layout } from '../components'

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  if (router.pathname === '/success') return <Component {...pageProps} />

  return (
    <SWRDevTools>
      <ErrorBoundary fallback={<Fallback />}>
        <UserProvider supabaseClient={supabaseClient}>
          <LiteralProvider>
            <RecoilRoot>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </RecoilRoot>
          </LiteralProvider>
        </UserProvider>
      </ErrorBoundary>
    </SWRDevTools>
  )
}

const Fallback: React.FC = () => {
  return <div>Something went wrong.</div>
}
