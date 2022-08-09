import { NextSeo } from 'next-seo'
import { MdCheck } from 'react-icons/md'

import { Button } from '../components'

export default function Pricing() {
  return (
    <>
      <NextSeo title="Pricing" />
      <div className="mt-5 flex flex-col items-center">
        <h1 className="typescale-headline-large text-on-surface">
          Pricing Plans
        </h1>
        <div className="mt-4 flex flex-wrap justify-center gap-8">
          <Plan
            name="Free"
            privileges={[
              'PWA',
              'Tabs',
              'Search',
              'Image Preview',
              'Annotation',
              'Custom Typography',
            ]}
            description="Free includes"
            price={0}
          />
          <Plan
            name="Premium"
            privileges={['10GB Cloud Storage', 'Data Synchronization']}
            description="Everything in Free, plus"
            price={2}
          />
        </div>
      </div>
    </>
  )
}

interface PlanProps {
  name: string
  privileges: string[]
  description: string
  price: number
}
export const Plan: React.FC<PlanProps> = ({
  name,
  privileges,
  description,
  price,
}) => {
  return (
    <div className="bg-outline/5 text-on-surface-variant w-60 p-4">
      <h2 className="typescale-title-large text-center">{name}</h2>
      <div className="text-outline mt-2 text-center">
        <span className="typescale-headline-large text-on-surface">
          ${price}
        </span>
        <span> /month</span>
      </div>
      <Button
        className="my-3 w-full"
        onClick={() => window.open('/', '_blank')}
      >
        Get Started
      </Button>
      <div className="typescale-title-small text-outline">{description}</div>
      <ul className="typescale-body-large mt-2 space-y-1">
        {privileges.map((p) => (
          <li key={p} className="flex items-center">
            <MdCheck className="mr-2 text-green-600" size={18} />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
