import { NextSeo } from 'next-seo'
import { MdCheck } from 'react-icons/md'

export default function Pricing() {
  return (
    <>
      <NextSeo title="Pricing" />
      <div className="mt-10 flex flex-col items-center">
        <h1 className="typescale-headline-large text-on-surface">
          Pricing Plans
        </h1>
        <div className="mt-10 flex gap-8">
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
            onClick={() => window.open('/', '_blank')}
          />
          <Plan
            name="Premium"
            privileges={['10GB Cloud Storage', 'Data Synchronization']}
            description="Everything in Free, plus"
            price={2}
            onClick={() => {}}
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
  onClick: () => void
}
export const Plan: React.FC<PlanProps> = ({
  name,
  privileges,
  description,
  price,
  onClick,
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
      <button
        className="typescale-title-medium bg-tertiary-container text-on-tertiary-container my-3 w-full p-2"
        onClick={onClick}
      >
        Get Started
      </button>
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
