import {
  TopAppBar,
  ColorScheme,
  NavDrawer,
  NavBar,
  AppShell,
} from '@literal-ui/core'
import { MdCheck } from 'react-icons/md'
import { useRecoilValue } from 'recoil'

import { navState } from '@ink/reader/state'

import { NavItem } from './NavItem'

const items = [
  { Icon: MdCheck, name: 'Label' },
  { Icon: MdCheck, name: 'Label' },
  { Icon: MdCheck, name: 'Label' },
  { Icon: MdCheck, name: 'Label' },
]

export const Layout: React.FC = ({ children }) => {
  const nav = useRecoilValue(navState)

  return (
    <AppShell
      className="relative !w-auto"
      header={
        <TopAppBar
          leading={
            <TopAppBar.Leading>
              {nav && <NavDrawer.Toggler />}
            </TopAppBar.Leading>
          }
          headline={<TopAppBar.Title>Ink Reader</TopAppBar.Title>}
          trailing={
            <TopAppBar.Trailing>
              <ColorScheme />
            </TopAppBar.Trailing>
          }
        />
      }
      sidebar={
        nav && (
          <NavDrawer className="scroll !px-0">
            {nav.toc.map((item, i) => (
              <NavItem key={i} item={item} />
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
