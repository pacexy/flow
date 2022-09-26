import useTranslation from 'next-translate/useTranslation'

import { range } from '@ink/internal'

import { QA, Seo } from '../components'

export default function Pricing() {
  const { t } = useTranslation()
  return (
    <>
      <Seo scope="faq" />

      <div className="container py-16">
        <h2 className="typescale-headline-medium mb-8 text-center">
          {t('frequently_asked_questions')}
        </h2>
        <div className="space-y-8">
          {range(2).map((i) => (
            <QA key={i} q={t(`qa2.${i}.q`)} a={t(`qa2.${i}.a`)} />
          ))}
        </div>
      </div>
    </>
  )
}
