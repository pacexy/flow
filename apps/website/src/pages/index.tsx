import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

import { range } from '@flow/internal'

import { OpenApp, QA, Seo } from '../components'

export default function Home() {
  const { locale } = useRouter()
  const { t } = useTranslation()

  return (
    <>
      <Seo scope="home" />
      <div>
        <div className="container py-16">
          <div className="flex flex-col items-center">
            <h1 className="typescale-display-large text-center">
              <span className="">{t('redefine')}</span>
              <br />
              <span className="text-on-surface font-light">
                ePub {t('reader')}
              </span>
            </h1>
            <div className="mt-8 mb-4 text-center">
              <div className="text-on-surface-variant/80 typescale-title-large mb-4">
                {t('description')}
              </div>
            </div>
            <OpenApp />
          </div>
          <div className="mt-12">
            <h2 className="typescale-title-large mb-4 text-center">
              {t('features.title')}
            </h2>
            <ul className="typescale-body-large mx-auto w-fit list-disc !text-[16px] sm:columns-2">
              {range(8).map((i) => (
                <li key={i} className="py-0.5">
                  {t(`features.list.${i}`)}
                </li>
              ))}
            </ul>
          </div>
          <img
            src={`/screenshots/${locale}.webp`}
            alt="Screenshot"
            className="shadow-1 mt-16"
          />
        </div>

        <div className="bg-gray-100 py-16">
          <div className="container">
            {range(4).map((i) => (
              <Feature
                key={i}
                title={t(`feature.${i}.title`)}
                description={t(`feature.${i}.desc`)}
              />
            ))}
          </div>
        </div>

        <div className="container py-16">
          <h2 className="typescale-headline-medium mb-8 text-center" id="faq">
            {t('frequently_asked_questions')}
          </h2>
          <div className="space-y-8">
            {range(5).map((i) => (
              <QA key={i} q={t(`qa2.${i}.q`)} a={t(`qa2.${i}.a`)} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

interface FeatureProps {
  title: string
  description: string
}
export const Feature: React.FC<FeatureProps> = ({ title, description }) => {
  return (
    <div className="py-8">
      <h2 className="typescale-headline-medium mb-4">{title}</h2>
      <p className="typescale-title-large text-on-surface-variant/80">
        {description}
      </p>
    </div>
  )
}
