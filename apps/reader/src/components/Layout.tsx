import { Overlay } from '@literal-ui/core'
import clsx from 'clsx'
import { ComponentProps, useEffect, useState } from 'react'
import { useMemo } from 'react'
import { IconType } from 'react-icons'
import {
  MdFormatUnderlined,
  MdSearch,
  MdToc,
  MdOutlineLightMode,
} from 'react-icons/md'
import { RiFontSize, RiHome6Line, RiSettings5Line } from 'react-icons/ri'

import {
  Env,
  Action,
  useAction,
  useBackground,
  useColorScheme,
  useMobile,
  useSetAction,
  useTranslation,
} from '../hooks'
import { reader, useReaderSnapshot } from '../models'
import { activeClass } from '../styles'

import { SplitView, useSplitViewItem } from './base'
import { Settings } from './pages'
import { AnnotationView } from './viewlets/AnnotationView'
import { SearchView } from './viewlets/SearchView'
import { ThemeView } from './viewlets/ThemeView'
import { TocView } from './viewlets/TocView'
import { TypographyView } from './viewlets/TypographyView'

export const Layout: React.FC = ({ children }) => {
  useColorScheme()

  const [ready, setReady] = useState(false)
  const setAction = useSetAction()
  const mobile = useMobile()

  useEffect(() => {
    if (mobile === undefined) return
    setAction(mobile ? undefined : 'toc')
    setReady(true)
  }, [mobile, setAction])

  return (
    <div id="layout" className="select-none">
      <SplitView>
        {mobile === false && <ActivityBar />}
        {mobile === true && <NavigationBar />}
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
    name: 'toc',
    title: 'toc',
    Icon: MdToc,
    View: TocView,
    env: Env.Desktop | Env.Mobile,
  },
  {
    name: 'search',
    title: 'search',
    Icon: MdSearch,
    View: SearchView,
    env: Env.Desktop | Env.Mobile,
  },
  {
    name: 'annotation',
    title: 'annotation',
    Icon: MdFormatUnderlined,
    View: AnnotationView,
    env: Env.Desktop | Env.Mobile,
  },
  {
    name: 'typography',
    title: 'typography',
    Icon: RiFontSize,
    View: TypographyView,
    env: Env.Desktop | Env.Mobile,
  },
  {
    name: 'theme',
    title: 'theme',
    Icon: MdOutlineLightMode,
    View: ThemeView,
    env: Env.Desktop | Env.Mobile,
  },
]

const ActivityBar: React.FC = () => {
  useSplitViewItem(ActivityBar, {
    preferredSize: 48,
    minSize: 48,
    maxSize: 48,
  })
  return (
    <div className="ActivityBar flex flex-col justify-between">
      <ViewActionBar env={Env.Desktop} />
    </div>
  )
}

interface EnvActionBarProps extends ComponentProps<'div'> {
  env: Env
}

function ViewActionBar({ className, env }: EnvActionBarProps) {
  const [action, setAction] = useAction()
  const t = useTranslation()

  return (
    <ActionBar className={className}>
      {viewActions
        .filter((a) => a.env & env)
        .map(({ name, title, Icon }) => {
          const active = action === name
          return (
            <Action
              title={t(`${title}.title`)}
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PageActionBar({ env }: EnvActionBarProps) {
  const mobile = useMobile()
  const [action, setAction] = useState('Home')
  const t = useTranslation()

  interface IPageAction extends IAction {
    Component?: React.FC
    disabled?: boolean
  }

  const pageActions: IPageAction[] = useMemo(
    () => [
      {
        name: 'home',
        title: 'home',
        Icon: RiHome6Line,
        env: Env.Mobile,
      },
      {
        name: 'settings',
        title: 'settings',
        Icon: RiSettings5Line,
        Component: Settings,
        env: Env.Desktop | Env.Mobile,
      },
    ],
    [],
  )

  return (
    <ActionBar>
      {pageActions
        .filter((a) => a.env & env)
        .map(({ name, title, Icon, Component, disabled }, i) => (
          <Action
            title={t(`${title}.title`)}
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
  return (
    <div className="NavigationBar bg-surface border-surface-variant fixed inset-x-0 bottom-0 z-10 border-t">
        <ViewActionBar
          env={Env.Mobile}
        />
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
  const [action, setAction] = useAction()
  const mobile = useMobile()
  const t = useTranslation()

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
            name={t(`${name}.title`)}
            title={t(`${title}.title`)}
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
