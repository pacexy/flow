import { useColorScheme } from '@literal-ui/hooks'
import clsx from 'clsx'
import { ComponentProps, useEffect } from 'react'
import { IconType } from 'react-icons'
import {
  MdFormatColorText,
  MdOutlineLightMode,
  MdSearch,
  MdToc,
} from 'react-icons/md'
import { useRecoilState, useRecoilValue } from 'recoil'

import { actionState, renditionState } from '../state'
import { keys } from '../utils'

import { SearchView } from './viewlets/SearchView'
import { TocView } from './viewlets/TocView'
import { TypographyView } from './viewlets/TypographyView'

export const Layout: React.FC = ({ children }) => {
  return (
    <div className="flex h-screen">
      <ActivityBar />
      <SideBar />
      <Reader className="flex-1 overflow-hidden">{children}</Reader>
    </div>
  )
}

const actionMap = {
  TOC: { title: 'Table of Content', Icon: MdToc, View: TocView },
  Search: { title: 'Search', Icon: MdSearch, View: SearchView },
  Typography: {
    title: 'Typography',
    Icon: MdFormatColorText,
    View: TypographyView,
  },
}

function ActivityBar() {
  const { toggle } = useColorScheme()
  const [action, setAction] = useRecoilState(actionState)
  return (
    <div className="bg-outline/10 hidden flex-col sm:flex">
      <ActionBar className="flex-1">
        {keys(actionMap).map((k) => {
          const active = action === k
          return (
            <Action
              title={actionMap[k].title}
              Icon={actionMap[k].Icon}
              active={active}
              onClick={() => setAction(active ? undefined : k)}
              key={k}
            />
          )
        })}
      </ActionBar>
      <ActionBar>
        <Action
          title="Toggle Color Scheme"
          Icon={MdOutlineLightMode}
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
        'text-outline/70 hover:text-on-surface relative flex h-12 w-12 items-center justify-center',
        active && 'text-on-surface',
        className,
      )}
      {...props}
    >
      {active && (
        <div className="bg-on-surface absolute inset-y-0 left-0 w-0.5" />
      )}
      <Icon size={28} />
    </button>
  )
}

function SideBar() {
  const action = useRecoilValue(actionState)
  const rendition = useRecoilValue(renditionState)

  useEffect(() => {
    // @ts-ignore
    rendition?.resize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!action])

  if (!action) return null

  return (
    <div
      className="bg-outline/5 hidden flex-col sm:flex"
      style={{ width: 240 }}
    >
      <h2
        title={action}
        className="typescale-body-small text-outline px-5 py-3"
      >
        {action.toUpperCase()}
      </h2>
      {Object.entries(actionMap).map(([a, { View }]) => (
        <View className={clsx(a !== action && '!hidden')} />
      ))}
    </div>
  )
}

interface ReaderProps extends ComponentProps<'div'> {}
function Reader({ className, ...props }: ReaderProps) {
  return <div className={clsx('', className)} {...props} />
}
