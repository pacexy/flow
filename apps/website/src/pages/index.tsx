import useTranslation from 'next-translate/useTranslation'

import { range } from '@ink/internal'

import { OpenApp, Seo } from '../components'

export default function Home() {
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
          <img
            src="/screenshot.png"
            alt="Screenshot"
            className="shadow-1 mt-16"
          />
        </div>

        <div className="py-16">
          <div className="container">
            {range(3).map((i) => (
              <Feature
                key={i}
                title={t(`feature.${i}.title`)}
                description={t(`feature.${i}.desc`)}
              />
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
    <div className="py-8 ">
      <h2 className="typescale-headline-medium mb-4">{title}</h2>
      <p className="typescale-title-large text-on-surface-variant/80">
        {description}
      </p>
    </div>
  )
}
