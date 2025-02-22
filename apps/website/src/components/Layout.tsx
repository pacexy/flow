import { Link } from '@literal-ui/next'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { ComponentProps } from 'react'
import { RiGithubFill } from 'react-icons/ri'

import { localeMap } from '../../i18n'

export const Layout: React.FC = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export const OpenApp: React.FC<ComponentProps<'a'>> = ({
  className,
  children,
}) => {
  const { t } = useTranslation()
  return (
    <Link
      href={process.env.NEXT_PUBLIC_APP_URL!}
      className={clsx(
        'typescale-title-medium select-none bg-black px-4 py-3 text-center text-white',
        className,
      )}
    >
      {children ?? t('open_app')}
    </Link>
  )
}

interface QAProps {
  q: string
  a: string
}
export const QA: React.FC<QAProps> = ({ q, a }) => {
  return (
    <div className="typescale-body-large">
      <h2 className="typescale-title-large mb-2">{q}</h2>
      <p className="text-outline" dangerouslySetInnerHTML={{ __html: a }}></p>
    </div>
  )
}

interface NavbarProps extends ComponentProps<'div'> {}
export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { t } = useTranslation()
  return (
    <div
      className={clsx(
        'text-outline typescale-body-large items-center gap-4',
        className,
      )}
    >
      <Link href="#faq">{t('faq')}</Link>
      <Link href="https://pacexy.notion.site/283696d0071c43bfb03652e8e5f47936?v=b43f4dd7a3cb4ce785d6c32b698a8ff5">
        {t('roadmap')}
      </Link>
      <Link href={t('donate_url')}>{t('donate')}</Link>
    </div>
  )
}

const Header: React.FC = () => {
  const { asPath, locale, push } = useRouter()

  return (
    <header className="typescale-body-large text-on-surface sticky top-0 border-b bg-white py-3">
      <div className="container flex items-center">
        <Link className="mr-8 flex items-center gap-3" href="/">
          <img src="/icons/512.png" alt="Logo" className="w-7" />
          <span className="typescale-title-large">Flow</span>
        </Link>
        <Navbar className="hidden sm:flex" />

        <div className="text-on-surface-variant ml-auto flex gap-3">
          <Link href="https://github.com/pacexy/flow">
            <RiGithubFill size={22} />
          </Link>
          <select
            className="bg-transparent outline-none"
            value={locale}
            onChange={(e) => {
              push(asPath, asPath, { locale: e.target.value })
            }}
          >
            {Object.entries(localeMap).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Navbar className="container mt-3 flex justify-end sm:hidden" />
    </header>
  )
}

const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-black py-4">
      <div className="container">
        <div className="text-inverse-on-surface typescale-body-small mb-4 flex gap-6">
          <Link href="/terms">{t('terms')}</Link>
          <Link href="/privacy">{t('privacy')}</Link>
          <a href="mailto:service@flowoss.com">{t('contact')}</a>
          <Link href="https://github.com/pacexy/flow/issues/new">
            {t('feedback')}
          </Link>
        </div>

        <div className="typescale-body-small text-white">
          © {new Date().getFullYear()} Flow
        </div>
      </div>
    </footer>
  )
}
