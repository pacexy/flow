import { useBoolean, useColorScheme } from '@literal-ui/hooks'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { IconType } from 'react-icons'
import {
  MdChevronRight,
  MdExpandMore,
  MdOutlineDarkMode,
  MdOutlineLightMode,
  MdSearch,
  MdToc,
} from 'react-icons/md'
import { useRecoilValue } from 'recoil'

import { navState } from '@ink/reader/state'

import { NavItem } from './NavItem'

export const Layout: React.FC = ({ children }) => {
  const nav = useRecoilValue(navState)
  const { toggle } = useColorScheme()

  return (
    <div className="flex h-screen">
      <ActivityBar>
        <ActionBar className="flex-1">
          <Action Icon={MdToc} />
          <Action Icon={MdSearch} />
        </ActionBar>
        <ActionBar>
          <Action
            Icon={MdOutlineDarkMode}
            onClick={toggle}
            className="hidden dark:flex"
          />
          <Action
            Icon={MdOutlineLightMode}
            onClick={toggle}
            className="dark:hidden"
          />
        </ActionBar>
      </ActivityBar>
      <SideBar>
        <Pane headline="toc">
          {nav?.toc.map((item, i) => (
            <NavItem key={i} item={item} />
          ))}
        </Pane>
      </SideBar>
      <Reader className="flex-1">{children}</Reader>
    </div>
  )
}

interface ActivityBarProps extends ComponentProps<'div'> {}
function ActivityBar({ className, ...props }: ActivityBarProps) {
  return (
    <div
      className={clsx('bg-outline/10 hidden flex-col sm:flex', className)}
      {...props}
    />
  )
}

interface ActionBarProps extends ComponentProps<'ul'> {}
function ActionBar({ className, ...props }: ActionBarProps) {
  return <ul className={clsx('flex flex-col', className)} {...props} />
}

interface ActionProps extends ComponentProps<'button'> {
  Icon: IconType
}
const Action: React.FC<ActionProps> = ({ className, Icon, ...props }) => {
  return (
    <button
      className={clsx(
        'text-outline/70 hover:text-on-surface flex h-12 w-12 items-center justify-center',
        className,
      )}
      {...props}
    >
      <Icon size={28} />
    </button>
  )
}

interface SideBarProps extends ComponentProps<'div'> {}
function SideBar({ className, children, ...props }: SideBarProps) {
  const headline = 'Title'
  return (
    <div
      className={clsx('bg-outline/5 hidden flex-col sm:flex', className)}
      style={{ width: 240 }}
      {...props}
    >
      <h2
        title={headline}
        className="typescale-body-small text-outline px-[22px] py-2"
      >
        {headline.toUpperCase()}
      </h2>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}

interface PaneProps extends ComponentProps<'div'> {
  headline: string
}
function Pane({ className, headline, children, ...props }: PaneProps) {
  const [open, toggle] = useBoolean(true)
  const Icon = open ? MdExpandMore : MdChevronRight
  return (
    <div className={clsx('h-full', className)} {...props}>
      <div role="button" className="flex items-center py-0.5" onClick={toggle}>
        <div>
          <Icon size={22} className="text-outline" />
        </div>
        <div className="typescale-label-medium text-on-surface-variant">
          {headline.toUpperCase()}
        </div>
      </div>
      {open && <div className="scroll">{children}</div>}
    </div>
  )
}

interface ReaderProps extends ComponentProps<'div'> {}
function Reader({ className, ...props }: ReaderProps) {
  return <div className={clsx('scroll', className)} {...props} />
}
