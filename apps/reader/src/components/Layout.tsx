import { Overlay } from '@literal-ui/core'
import clsx from 'clsx'
import { ComponentProps, useEffect, useState } from 'react'
import { IconType } from 'react-icons'
import {
  MdFormatUnderlined,
  MdOutlineImage,
  MdSearch,
  MdToc,
  MdTimeline,
} from 'react-icons/md'
import { RiFontSize } from 'react-icons/ri'
import { VscAccount, VscHome } from 'react-icons/vsc'
import { useRecoilState } from 'recoil'
import { useSnapshot } from 'valtio'

import { ENV, useEnv, useInitSubscription, useMobile } from '../hooks'
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

interface IAction {
  name: string
  title: string
  Icon: IconType
  env: number
}
interface IViewAction extends IAction {
  name: Action
  View: React.FC<any>
}
interface IPageAction extends IAction {
  onClick: () => void
}
const viewActions: IViewAction[] = [
  {
    name: 'TOC',
    title: 'Table of Content',
    Icon: MdToc,
    View: TocView,
    env: ENV.Desktop | ENV.MOBILE,
  },
  {
    name: 'Search',
    title: 'Search',
    Icon: MdSearch,
    View: SearchView,
    env: ENV.Desktop | ENV.MOBILE,
  },
  {
    name: 'Annotation',
    title: 'Annotation',
    Icon: MdFormatUnderlined,
    View: AnnotationView,
    env: ENV.Desktop | ENV.MOBILE,
  },
  {
    name: 'Image',
    title: 'Image',
    Icon: MdOutlineImage,
    View: ImageView,
    env: ENV.Desktop,
  },
  {
    name: 'Timeline',
    title: 'Timeline',
    Icon: MdTimeline,
    View: TimelineView,
    env: ENV.Desktop,
  },
  {
    name: 'Typography',
    title: 'Typography',
    Icon: RiFontSize,
    View: TypographyView,
    env: ENV.Desktop | ENV.MOBILE,
  },
]

const pageActions: IPageAction[] = [
  {
    name: 'Home',
    title: 'Home',
    Icon: VscHome,
    onClick: () => reader.clear(),
    env: ENV.MOBILE,
  },
  {
    name: 'Account',
    title: 'Account',
    Icon: VscAccount,
    onClick: () => reader.addTab(Account),
    env: ENV.Desktop | ENV.MOBILE,
  },
]

function ActivityBar() {
  return (
    <div className="ActivityBar hidden flex-col justify-between sm:flex">
      <ViewActionBar />
      <PageActionBar />
    </div>
  )
}

function ViewActionBar({ className }: ComponentProps<'div'>) {
  const [action, setAction] = useRecoilState(actionState)
  const env = useEnv()

  return (
    <ActionBar className={className}>
      {viewActions
        .filter((a) => a.env & env)
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

function PageActionBar() {
  const mobile = useMobile()
  const env = useEnv()
  const [action, setAction] = useState('Home')
  return (
    <ActionBar>
      {pageActions
        .filter((a) => a.env & env)
        .map(({ name, title, Icon, onClick }, i) => (
          <Action
            title={title}
            Icon={Icon}
            active={mobile ? action === name : undefined}
            onClick={() => {
              onClick()
              setAction(name)
            }}
            key={i}
          />
        ))}
    </ActionBar>
  )
}

function NavigationBar() {
  const r = useSnapshot(reader)
  const readMode = r.focusedTab?.isBook
  const [visible, setVisible] = useRecoilState(navbarState)
  const mobile = useMobile()

  if (!mobile) return null
  return (
    <>
      <div className="NavigationBar bg-surface absolute inset-x-0 bottom-0 z-20 border-t">
        {readMode ? (
          <ViewActionBar className={clsx(visible || 'hidden')} />
        ) : (
          <PageActionBar />
        )}
      </div>
      {visible && (
        <Overlay
          className="!bg-transparent"
          onClick={() => setVisible(false)}
        />
      )}
    </>
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
  const mobile = useMobile()
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
        <div
          className={clsx(
            'absolute bg-blue-400',
            mobile ? 'inset-x-0 bottom-0 h-0.5' : 'inset-y-0 left-0 w-0.5',
          )}
        />
      )}
      <Icon size={28} />
    </button>
  )
}

function SideBar() {
  const [action, setAction] = useRecoilState(actionState)
  const { groups } = useSnapshot(reader)
  const mobile = useMobile()

  useEffect(() => {
    if (mobile === false) setAction('TOC')
  }, [mobile, setAction])

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
    <>
      <div
        className={clsx(
          'bg-surface flex w-60 flex-col',
          !action && '!hidden',
          mobile ? 'absolute bottom-12 right-0 top-0 z-20' : '',
        )}
      >
        {viewActions.map(({ name, title, View }) => (
          <View
            key={name}
            name={name}
            title={title}
            className={clsx(name !== action && '!hidden')}
          />
        ))}
      </div>
      {action && mobile && <Overlay onClick={() => setAction(undefined)} />}
    </>
  )
}

interface ReaderProps extends ComponentProps<'div'> {}
function Reader({ className, ...props }: ReaderProps) {
  return <div className={clsx('', className)} {...props} />
}
