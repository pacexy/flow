import { Link } from '@literal-ui/next'
import { NextSeo } from 'next-seo'

import { OpenApp } from '../components'

export default function Home() {
  return (
    <>
      <NextSeo title="Lota - Redefine EPUB reader" />
      <div>
        <div className="container py-16">
          <div className="flex flex-col items-center">
            <h1 className="typescale-display-large text-center">
              Redefine
              <br />
              <span className="text-outline">EPUB reader</span>
            </h1>
            <Link
              className="mt-8 mb-4"
              href="https://www.producthunt.com/posts/lota?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-lota"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=359912&theme=light"
                alt="Lota - Redefine&#0032;EPUB&#0032;reader | Product Hunt"
                width="250"
                height="54"
              />
            </Link>
            <div className="mt-8 mb-10 text-center">
              <div className="text-outline typescale-body-large mb-4">
                Progressive web app, which means
              </div>
              <ul className="typescale-title-large space-y-2">
                <li>Cross-platform</li>
                <li>Installable</li>
                <li>Integrate with browser extensions</li>
              </ul>
            </div>

            <OpenApp />
          </div>
          <img
            src="screenshot.png"
            alt="Screenshot"
            className="shadow-1 mt-16"
          />
        </div>

        <div className="bg-gray-100 py-16">
          <div className="container">
            <Feature
              title="Free"
              description="All of Lota's features are free except for cloud storage."
            />
            <Feature
              title="Grid layout"
              description="Lota supports (horizontal) grid layout, which allows you to read multiple books at the same time."
            />
            <Feature
              title="Cloud storage"
              description="Store your books, notes, reading progress and even other data in the cloud. Lota will sync them between your devices."
            />
          </div>
        </div>

        <div className="container flex flex-col items-center gap-8 py-16">
          <div className="typescale-display-small text-center">
            Next-generation EPUB reader
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
