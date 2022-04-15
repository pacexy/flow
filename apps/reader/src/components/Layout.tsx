import {
  TopAppBar,
  IconButton,
  ColorScheme,
  NavDrawer,
  NavBar,
  AppShell,
} from '@literal-ui/core'
import { Link } from '@literal-ui/next'
import { MdCheck } from 'react-icons/md'
import { RiGithubFill } from 'react-icons/ri'
import { useRecoilValue } from 'recoil'

import { navState } from '@ink/reader/state'

const items = [
  { Icon: MdCheck, name: 'Label' },
  { Icon: MdCheck, name: 'Label' },
  { Icon: MdCheck, name: 'Label' },
  { Icon: MdCheck, name: 'Label' },
]

export const Layout: React.FC = ({ children }) => {
  const nav = useRecoilValue(navState)
  console.log(nav)

  return (
    <AppShell
      className="relative !w-auto"
      header={
        <TopAppBar
          leading={
            <TopAppBar.Leading>
              <NavDrawer.Toggler />
            </TopAppBar.Leading>
          }
          headline={<TopAppBar.Title>Ink</TopAppBar.Title>}
          trailing={
            <TopAppBar.Trailing>
              <IconButton
                as={Link}
                href="https://github.com/pacexy/ink"
                Icon={RiGithubFill}
              />
              <ColorScheme />
            </TopAppBar.Trailing>
          }
        />
      }
      sidebar={
        nav && (
          <NavDrawer>
            {nav.toc.map(({ label, subitems }, i) => (
              <NavDrawer.Section key={i} headline={label}>
                {subitems?.map((item, j) => (
                  <NavDrawer.Item key={j}>
                    <Link href={`/`}>{item.label}</Link>
                  </NavDrawer.Item>
                ))}
              </NavDrawer.Section>
            ))}
          </NavDrawer>
        )
      }
      navbar={
        <NavBar className="sm:hidden">
          {items.map(({ Icon, name }, i) => (
            <NavBar.Item key={i} Icon={Icon}>
              <a>{name}</a>
            </NavBar.Item>
          ))}
        </NavBar>
      }
    >
      {children}
    </AppShell>
  )
}
