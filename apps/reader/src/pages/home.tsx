import { OpenApp } from '../layout'

export default function Home() {
  return (
    <div>
      <div className="container flex flex-wrap justify-center gap-12 py-16">
        <div className="flex flex-col items-center py-4">
          <h1 className="typescale-display-small text-center">
            Redefine
            <br />
            <span className="text-outline">EPUB reader</span>
          </h1>
          <div className="text-outline typescale-body-large mt-4 mb-8">
            Free. Runs everywhere.
          </div>
          <OpenApp />
        </div>
        <img
          src="screenshot.png"
          alt="Screenshot"
          className="shadow-1 w-[640px] flex-1"
        />
      </div>

      <div className="bg-gray-100 py-16">
        <div className="container">
          <Feature
            title="Free"
            description="All of Lota's features are free except for cloud storage."
          />
          <Feature
            title="Flexible Layout"
            description="Lota has a flexible layout that makes it very easy to open multiple Tabs and even multiple Tab groups to browse multiple books at the same time."
          />
          <Feature
            title="Runs Everywhere"
            description="Lota is a PWA (Progressive Web App) that works on any device (including mobile) with a browser installed, and is installable like a regular app."
          />
          <Feature
            title="Cloud Storage"
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
      <p className="typescale-body-large">{description}</p>
    </div>
  )
}
