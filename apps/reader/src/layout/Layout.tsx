import { Link } from '@literal-ui/next'

export const Layout: React.FC = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1">{children}</main>
      <Footer />
    </div>
  )
}

const Header: React.FC = () => {
  return (
    <header className="typescale-body-large text-on-surface container flex h-12">
      <a className="mr-8 flex items-center gap-4" href="/home">
        <img src="icons/512.png" alt="Logo" className="w-8" />
        <span className="typescale-headline-small">Lota</span>
      </a>
      <div className="text-outline typescale-body-large flex items-center gap-6">
        <Link href="/pricing">Pricing</Link>
        <Link href="/faq">FAQ</Link>
      </div>
      <a
        className="typescale-title-medium ml-auto hidden bg-black px-4 py-3 text-white sm:block"
        href="/"
        target="_blank"
      >
        Open App
      </a>
    </header>
  )
}

const Footer: React.FC = () => {
  return (
    <footer className="mt-10 bg-black py-4">
      <div className="container">
        <div className="text-inverse-on-surface typescale-body-small mb-4 flex gap-6">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <a href="mailto:pacexy@gmail.com">Contact</a>
          <Link href="https://pacexy.notion.site/283696d0071c43bfb03652e8e5f47936?v=b43f4dd7a3cb4ce785d6c32b698a8ff5">
            Roadmap
          </Link>
        </div>

        <div className="typescale-body-small text-white">
          © {new Date().getFullYear()} Lota
        </div>
      </div>
    </footer>
  )
}
