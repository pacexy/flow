import { NextSeo } from 'next-seo'

import { QA } from '../layout'

export default function Pricing() {
  return (
    <>
      <NextSeo title="Frequently Asked Questions - Lota" />

      <div className="container py-16">
        <h2 className="typescale-headline-medium mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-8">
          <QA
            q="Where are my data stored?"
            a="Your data is stored locally in your browser. If you upload a book, there will be a remote copy in the cloud."
          />
          <QA
            q="How to clear my data?"
            a="For local data, clear the browser cache. For remote data, select and delete the books you want to clear (this will also clear your local books)."
          />
        </div>
      </div>
    </>
  )
}
