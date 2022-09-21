import { Link } from '@literal-ui/next'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { ComponentProps } from 'react'
import { MdLanguage } from 'react-icons/md'

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
  a: React.ReactNode
}
export const QA: React.FC<QAProps> = ({ q, a }) => {
  return (
    <div className="typescale-body-large">
      <h2 className="typescale-title-large mb-2">{q}</h2>
      <p className="text-outline">{a}</p>
    </div>
  )
}

const Header: React.FC = () => {
  const { locale, defaultLocale, asPath } = useRouter()
  const { t } = useTranslation()

  return (
    <header className="typescale-body-large text-on-surface container flex py-3">
      <Link className="mr-8 flex items-center gap-3" href="/">
        <img src="/icons/512.png" alt="Logo" className="w-7" />
        <span className="typescale-title-large">Lota</span>
      </Link>
      <div className="text-outline typescale-body-large flex items-center gap-4">
        <Link href="/pricing">{t('pricing')}</Link>
        <Link href="/faq">{t('faq')}</Link>
        <Link href="https://pacexy.notion.site/283696d0071c43bfb03652e8e5f47936?v=b43f4dd7a3cb4ce785d6c32b698a8ff5">
          {t('roadmap')}
        </Link>
      </div>

      <div className="ml-auto hidden gap-8 sm:flex">
        <Link
          href={asPath}
          locale={locale === defaultLocale ? 'zh-CN' : 'en-US'}
          className="flex items-center gap-2"
        >
          <MdLanguage size={22} className="text-outline" />
          <span>{locale === defaultLocale ? '简体中文' : 'English'}</span>
        </Link>
      </div>
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
          <a href="mailto:service@lotareader.com">{t('contact')}</a>
          <Link href="https://github.com/pacexy/lota/issues/new/choose">
            {t('feedback')}
          </Link>
        </div>

        <div className="typescale-body-small text-white">
          © {new Date().getFullYear()} Lota
        </div>
      </div>
    </footer>
  )
}
