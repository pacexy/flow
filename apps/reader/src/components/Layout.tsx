import { Overlay } from '@literal-ui/core'
import { useUser } from '@supabase/auth-helpers-react'
import clsx from 'clsx'
import { ComponentProps, useEffect, useState } from 'react'
import { useMemo } from 'react'
import { IconType } from 'react-icons'
import {
  MdFormatUnderlined,
  MdOutlineImage,
  MdSearch,
  MdToc,
  MdTimeline,
  MdOutlineLightMode,
} from 'react-icons/md'
import {
  RiFontSize,
  RiAccountCircleLine,
  RiSettingsLine,
  RiHome6Line,
} from 'react-icons/ri'
import { useRecoilState, useSetRecoilState } from 'recoil'

import {
  ENV,
  useBackground,
  useColorScheme,
  useEnv,
  useInitSubscription,
  useMobile,
} from '../hooks'
import { reader, useReaderSnapshot } from '../models'
import { Action, actionState, navbarState } from '../state'
import { activeClass } from '../styles'

import { SplitView, useSplitViewItem } from './base'
import { Account, Auth, Settings } from './pages'
import { AnnotationView } from './viewlets/AnnotationView'
import { ImageView } from './viewlets/ImageView'
import { SearchView } from './viewlets/SearchView'
import { ThemeView } from './viewlets/ThemeView'
import { TimelineView } from './viewlets/TimelineView'
import { TocView } from './viewlets/TocView'
import { TypographyView } from './viewlets/TypographyView'

export const Layout: React.FC = ({ children }) => {
  useColorScheme()
  useInitSubscription()

  const [ready, setReady] = useState(false)
  const setAction = useSetRecoilState(actionState)
  const mobile = useMobile()

  useEffect(() => {
    if (mobile === undefined) return
    setAction(mobile ? undefined : 'TOC')
    setReady(true)
  }, [mobile, setAction])

  return (
    <div id="layout" className="select-none">
      <SplitView>
        <ActivityBar />
        {mobile && <NavigationBar />}
        {ready && <SideBar />}
        {ready && <Reader>{children}</Reader>}
      </SplitView>
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
  {
    name: 'Theme',
    title: 'Theme',
    Icon: MdOutlineLightMode,
    View: ThemeView,
    env: ENV.Desktop | ENV.MOBILE,
  },
]

const ActivityBar: React.FC = () => {
  useSplitViewItem(ActivityBar, {
    preferredSize: 48,
    minSize: 48,
    maxSize: 48,
  })
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
  const { user, isLoading } = useUser()
  const [action, setAction] = useState('Home')

  interface IPageAction extends IAction {
    Component?: React.FC
    disabled?: boolean
  }

  const pageActions: IPageAction[] = useMemo(
    () => [
      {
        name: 'Home',
        title: 'Home',
        Icon: RiHome6Line,
        env: ENV.MOBILE,
      },
      {
        name: 'Account',
        title: 'Account',
        Icon: RiAccountCircleLine,
        Component: user ? Account : Auth,
        env: ENV.Desktop | ENV.MOBILE,
        disabled: isLoading,
      },
      {
        name: 'Settings',
        title: 'Settings',
        Icon: RiSettingsLine,
        Component: Settings,
        env: ENV.Desktop | ENV.MOBILE,
      },
    ],
    [isLoading, user],
  )

  return (
    <ActionBar>
      {pageActions
        .filter((a) => a.env & env)
        .map(({ name, title, Icon, Component, disabled }, i) => (
          <Action
            title={title}
            Icon={Icon}
            active={mobile ? action === name : undefined}
            disabled={disabled}
            onClick={() => {
              Component ? reader.addTab(Component) : reader.clear()
              setAction(name)
            }}
            key={i}
          />
        ))}
    </ActionBar>
  )
}

function NavigationBar() {
  const r = useReaderSnapshot()
  const readMode = r.focusedTab?.isBook
  const [visible, setVisible] = useRecoilState(navbarState)

  return (
    <>
      {visible && (
        <Overlay
          className="!bg-transparent"
          onClick={() => setVisible(false)}
        />
      )}
      <div className="NavigationBar bg-surface border-surface-variant fixed inset-x-0 bottom-0 z-10 border-t">
        {readMode ? (
          <ViewActionBar className={clsx(visible || 'hidden')} />
        ) : (
          <PageActionBar />
        )}
      </div>
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
        'Action relative flex h-12 w-12 flex-1 items-center justify-center sm:flex-initial',
        active ? 'text-on-surface-variant' : 'text-outline/70',
        props.disabled ? 'text-on-disabled' : 'hover:text-on-surface-variant ',
        className,
      )}
      {...props}
    >
      {active &&
        (mobile || (
          <div
            className={clsx('absolute', 'inset-y-0 left-0 w-0.5', activeClass)}
          />
        ))}
      <Icon size={28} />
    </button>
  )
}

const SideBar: React.FC = () => {
  const [action, setAction] = useRecoilState(actionState)
  const mobile = useMobile()

  const { size } = useSplitViewItem(SideBar, {
    preferredSize: 240,
    minSize: 160,
    visible: !!action,
  })

  return (
    <>
      {action && mobile && <Overlay onClick={() => setAction(undefined)} />}
      <div
        className={clsx(
          'SideBar bg-surface flex flex-col',
          !action && '!hidden',
          mobile ? 'absolute inset-y-0 right-0 z-10' : '',
        )}
        style={{ width: mobile ? '75%' : size }}
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
    </>
  )
}

interface ReaderProps extends ComponentProps<'div'> {}
const Reader: React.FC = ({ className, ...props }: ReaderProps) => {
  useSplitViewItem(Reader)
  const [bg] = useBackground()

  const r = useReaderSnapshot()
  const readMode = r.focusedTab?.isBook

  return (
    <div
      className={clsx(
        'Reader flex-1 overflow-hidden',
        readMode || 'mb-12 sm:mb-0',
        bg,
      )}
      {...props}
    />
  )
}
