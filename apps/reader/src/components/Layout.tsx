import { useColorScheme } from '@literal-ui/hooks'
import clsx from 'clsx'
import { ComponentProps, useEffect } from 'react'
import { IconType } from 'react-icons'
import {
  MdFormatUnderlined,
  MdOutlineImage,
  MdSearch,
  MdToc,
  MdTimeline,
} from 'react-icons/md'
import {
  RiFullscreenFill,
  RiFontSize,
  RiFullscreenExitFill,
} from 'react-icons/ri'
import { VscAccount, VscColorMode, VscHome } from 'react-icons/vsc'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useSnapshot } from 'valtio'

import { useFullScreen, useInitSubscription, useMobile } from '../hooks'
import { Action, actionState, navbarState } from '../state'

import { reader } from './Reader'
import { Account } from './pages'
import { AnnotationView } from './viewlets/AnnotationView'
import { ImageView } from './viewlets/ImageView'
import { SearchView } from './viewlets/SearchView'
import { TimelineView } from './viewlets/TimelineView'
import { TocView } from './viewlets/TocView'
import { TypographyView } from './viewlets/TypographyView'

export const Layout: React.FC = ({ children }) => {
  useInitSubscription()
  const r = useSnapshot(reader)
  const readMode = r.focusedTab?.isBook

  return (
    <div className="flex h-screen select-none bg-white dark:bg-[#121212]">
      <ActivityBar />
      <NavigationBar />
      <SideBar />
      <Reader
        className={clsx('flex-1 overflow-hidden', readMode || 'mb-12 sm:mb-0')}
      >
        {children}
      </Reader>
    </div>
  )
}

type IAction = {
  name: Action
  title: string
  Icon: IconType
  View: React.FC<any>
  mobile?: boolean
}
const actions: IAction[] = [
  {
    name: 'TOC',
    title: 'Table of Content',
    Icon: MdToc,
    View: TocView,
    mobile: true,
  },
  {
    name: 'Search',
    title: 'Search',
    Icon: MdSearch,
    View: SearchView,
    mobile: true,
  },
  {
    name: 'Annotation',
    title: 'Annotation',
    Icon: MdFormatUnderlined,
    View: AnnotationView,
    mobile: true,
  },
  {
    name: 'Image',
    title: 'Image',
    Icon: MdOutlineImage,
    View: ImageView,
  },
  {
    name: 'Timeline',
    title: 'Timeline',
    Icon: MdTimeline,
    View: TimelineView,
    mobile: true,
  },
  {
    name: 'Typography',
    title: 'Typography',
    Icon: RiFontSize,
    View: TypographyView,
    mobile: true,
  },
]

const pages = [
  {
    name: 'Account',
    title: 'Account',
    Icon: VscAccount,
    onClick: () => reader.addTab(Account),
  },
]

function ActivityBar() {
  const { toggle } = useColorScheme()
  const fullscreen = useFullScreen()

  return (
    <div className="ActivityBar hidden sm:flex sm:flex-col">
      <MainActionBar />
      <ActionBar className="mt-auto">
        {pages.map(({ title, Icon, onClick }, i) => (
          <Action title={title} Icon={Icon} onClick={onClick} key={i} />
        ))}
        <Action
          title="Toggle FullScreen"
          Icon={fullscreen.active ? RiFullscreenExitFill : RiFullscreenFill}
          onClick={fullscreen.toggle}
        />
        <Action
          title="Toggle Color Scheme"
          Icon={VscColorMode}
          onClick={toggle}
        />
      </ActionBar>
    </div>
  )
}

function MainActionBar() {
  const [action, setAction] = useRecoilState(actionState)
  const mobile = useMobile()
  return (
    <ActionBar>
      {actions
        .filter((a) => (mobile ? a.mobile : true))
        .map(({ name, title, Icon }) => {
          const active = action === name
          return (
            <Action
              title={title}
              Icon={Icon}
              active={active}
              onClick={() => setAction(active ? undefined : name)}
              key={name}
            />
          )
        })}
    </ActionBar>
  )
}

function NavigationBar() {
  const r = useSnapshot(reader)
  const readMode = r.focusedTab?.isBook
  const visible = useRecoilValue(navbarState)
  const mobile = useMobile()

  if (!mobile) return null
  return (
    <div className="NavigationBar bg-surface absolute inset-x-0 bottom-0 z-10">
      {readMode ? (
        visible && <MainActionBar />
      ) : (
        <ActionBar>
          <Action
            title="Home"
            Icon={VscHome}
            onClick={() => reader.removeGroup(0)}
          />
          {pages.map(({ title, Icon, onClick }, i) => (
            <Action title={title} Icon={Icon} onClick={onClick} key={i} />
          ))}
        </ActionBar>
      )}
    </div>
  )
}

interface ActionBarProps extends ComponentProps<'ul'> {}
function ActionBar({ className, ...props }: ActionBarProps) {
  return (
    <ul className={clsx('ActionBar flex sm:flex-col', className)} {...props} />
  )
}

interface ActionProps extends ComponentProps<'button'> {
  Icon: IconType
  active?: boolean
}
const Action: React.FC<ActionProps> = ({
  className,
  Icon,
  active,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'Action hover:text-on-surface-variant relative flex h-12 w-12 flex-1 items-center justify-center sm:flex-initial',
        active ? 'text-on-surface-variant' : 'text-outline/70',
        className,
      )}
      {...props}
    >
      {active && (
        <div className="absolute inset-y-0 left-0 hidden w-0.5 bg-blue-400 sm:block" />
      )}
      <Icon size={28} />
    </button>
  )
}

function SideBar() {
  const action = useRecoilValue(actionState)
  const { groups } = useSnapshot(reader)

  useEffect(() => {
    groups.forEach(({ bookTabs }) => {
      bookTabs.forEach(({ rendition }) => {
        // @ts-ignore
        rendition?.resize()
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!action])

  return (
    <div
      className={clsx(
        'bg-outline/5 hidden flex-col sm:flex',
        !action && '!hidden',
      )}
      style={{ width: 240 }}
    >
      {actions.map(({ name, title, View }) => (
        <View
          key={name}
          name={name}
          title={title}
          className={clsx(name !== action && '!hidden')}
        />
      ))}
    </div>
  )
}

interface ReaderProps extends ComponentProps<'div'> {}
function Reader({ className, ...props }: ReaderProps) {
  return <div className={clsx('', className)} {...props} />
}
