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
              {t('redefine')}
              <br />
              <span className="text-outline">EPUB {t('reader')}</span>
            </h1>
            <div className="mt-8 mb-10 text-center">
              <div className="text-outline typescale-body-large mb-4">
                {t('pwa')}, {t('which_means')}
              </div>
              <ul className="typescale-title-large space-y-2">
                {range(3).map((i) => (
                  <li key={i}>{t(`f${i}`)}</li>
                ))}
              </ul>
            </div>
            <OpenApp />
          </div>
          <img
            src="/screenshot.png"
            alt="Screenshot"
            className="shadow-1 mt-16"
          />
        </div>

        <div className="bg-gray-100 py-16">
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

        <div className="container flex flex-col items-center gap-8 py-16">
          <div className="typescale-display-small text-center">
            {t('next_generation')} EPUB {t('reader')}
          </div>
          <OpenApp />
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
      <p className="typescale-title-large text-outline">{description}</p>
    </div>
  )
}
