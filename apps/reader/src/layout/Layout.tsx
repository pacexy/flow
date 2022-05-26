import { Link } from '@literal-ui/next'

export const Layout: React.FC = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

const Header: React.FC = () => {
  return (
    <header className="typescale-body-large text-on-surface flex justify-center gap-8">
      <Link href="/">Home</Link>
      <Link href="/pricing">Pricing</Link>
    </header>
  )
}

const Footer: React.FC = () => {
  return (
    <footer className="typescale-body-medium text-outline flex justify-center gap-8 py-2">
      <a href="mailto:pacexy@gmail.com">Contact</a>
      <Link href="/privacy">Privacy Policy</Link>
      <Link href="/terms">Term of Use</Link>
    </footer>
  )
}
