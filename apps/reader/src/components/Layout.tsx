import { useColorScheme } from '@literal-ui/hooks'
import clsx from 'clsx'
import { ComponentProps, useEffect } from 'react'
import { IconType } from 'react-icons'
import {
  MdFormatUnderlined,
  MdOutlineImage,
  MdSearch,
  MdToc,
} from 'react-icons/md'
import {
  RiFullscreenFill,
  RiFontSize,
  RiFullscreenExitFill,
} from 'react-icons/ri'
import { VscColorMode } from 'react-icons/vsc'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useSnapshot } from 'valtio'

import { useFullScreen } from '../hooks'
import { actionState } from '../state'

import { reader } from './Reader'
import { AnnotationView } from './viewlets/AnnotationView'
import { ImageView } from './viewlets/ImageView'
import { SearchView } from './viewlets/SearchView'
import { TocView } from './viewlets/TocView'
import { TypographyView } from './viewlets/TypographyView'

export const Layout: React.FC = ({ children }) => {
  return (
    <div className="flex h-screen bg-white dark:bg-[#121212]">
      <ActivityBar />
      <SideBar />
      <Reader className="flex-1 overflow-hidden">{children}</Reader>
    </div>
  )
}

const actions = [
  { name: 'TOC', title: 'Table of Content', Icon: MdToc, View: TocView },
  {
    name: 'Search',
    title: 'Search',
    Icon: MdSearch,
    View: SearchView,
  },
  {
    name: 'Annotation',
    title: 'Annotation',
    Icon: MdFormatUnderlined,
    View: AnnotationView,
  },
  {
    name: 'Image',
    title: 'Image',
    Icon: MdOutlineImage,
    View: ImageView,
  },
  {
    name: 'Typography',
    title: 'Typography',
    Icon: RiFontSize,
    View: TypographyView,
  },
] as const

function ActivityBar() {
  const { toggle } = useColorScheme()
  const [action, setAction] = useRecoilState(actionState)
  const fullscreen = useFullScreen()
  return (
    <div className="hidden flex-col sm:flex">
      <ActionBar className="flex-1">
        {actions.map(({ name, title, Icon }) => {
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
      <ActionBar>
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

interface ActionBarProps extends ComponentProps<'ul'> {}
function ActionBar({ className, ...props }: ActionBarProps) {
  return <ul className={clsx('flex flex-col', className)} {...props} />
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
        'hover:text-on-surface-variant relative flex h-12 w-12 items-center justify-center',
        active ? 'text-on-surface-variant' : 'text-outline/70',
        className,
      )}
      {...props}
    >
      {active && (
        <div className="absolute inset-y-0 left-0 w-0.5 bg-blue-400" />
      )}
      <Icon size={28} />
    </button>
  )
}

function SideBar() {
  const action = useRecoilValue(actionState)
  const { groups } = useSnapshot(reader)

  useEffect(() => {
    groups.forEach(({ tabs }) => {
      tabs.forEach(({ rendition }) => {
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
