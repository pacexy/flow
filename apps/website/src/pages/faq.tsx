import { NextSeo } from 'next-seo'
import useTranslation from 'next-translate/useTranslation'

import { range } from '@ink/internal'

import { QA } from '../components'

export default function Pricing() {
  const { t } = useTranslation()
  return (
    <>
      <NextSeo title="Frequently Asked Questions - Lota" />

      <div className="container py-16">
        <h2 className="typescale-headline-medium mb-8 text-center">
          {t('frequently_asked_questions')}
        </h2>
        <div className="space-y-8">
          {range(2).map((i) => (
            <QA key={i} q={t(`qa2.${i}.q`)} a={t(`qa.${i}.a`)} />
          ))}
        </div>
      </div>
    </>
  )
}
