import { useBoolean } from '@literal-ui/hooks'
import useTranslation from 'next-translate/useTranslation'

import { range } from '@ink/internal'

import { OpenApp, QA, Seo } from '../components'

export default function Pricing() {
  const [annual, toggle] = useBoolean(false)
  const { t } = useTranslation()
  return (
    <>
      <Seo scope="pricing" />
      <div className="container">
        <div className="flex flex-col items-center py-16">
          <h2 className="typescale-headline-medium">{t('pricing_plans')}</h2>
          <div>
            <label className="text-on-surface-variant typescale-title-medium my-8 flex select-none items-center gap-2">
              <input
                type="checkbox"
                checked={annual}
                onChange={toggle}
                className="h-[18px] w-[18px]"
              />
              {t('yearly')}
            </label>
          </div>
          <div
            className="text-outline typescale-body-medium mb-6 max-w-sm text-center"
            dangerouslySetInnerHTML={{ __html: t('pricing_tips') }}
          ></div>
          <div className="flex flex-wrap justify-center gap-8">
            <Plan
              name={t('free.title')}
              privileges={range(6).map((i) => t(`free.${i}`))}
              description={t('free_includes')}
              price={t('free.price')}
              annual={annual}
            />
            <Plan
              name={t('premium.title')}
              privileges={range(2).map((i) => t(`premium.${i}`))}
              description={t('everything_in_free_plus')}
              price={t('premium.price')}
              annual={annual}
            />
          </div>
        </div>

        <div className="py-16">
          <h2 className="typescale-headline-medium mb-8 text-center">
            {t('frequently_asked_questions')}
          </h2>
          <div className="space-y-8">
            {range(3).map((i) => (
              <QA key={i} q={t(`qa.${i}.q`)} a={t(`qa.${i}.a`)} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

interface PlanProps {
  name: string
  privileges: string[]
  description: string
  price?: number
  annual?: boolean
}
const Plan: React.FC<PlanProps> = ({
  name,
  privileges,
  description,
  // price,
  annual = false,
}) => {
  const { t } = useTranslation()

  return (
    <div className="bg-outline/5 flex w-64 flex-col gap-8 p-8">
      <h2 className="typescale-title-large text-center">{name}</h2>
      <div className="text-center">
        <span className="typescale-display-large mr-1">{t('currency')}0</span>
        <span className="text-outline">/{t(annual ? 'year' : 'month')}</span>
      </div>

      <OpenApp>{t('get_started')}</OpenApp>

      <div>
        <div className="text-outline typescale-body-medium">{description}</div>
        <ul className="text-on-surface typescale-body-large mt-3 space-y-1">
          {privileges.map((p, i) => (
            <li key={i} className="flex items-center">
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
