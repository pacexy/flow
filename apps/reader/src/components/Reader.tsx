import { StateLayer } from '@literal-ui/core'
import { useColorScheme } from '@literal-ui/hooks'
import clsx from 'clsx'
import ePub, { Book, Rendition } from 'epubjs'
import type Navigation from 'epubjs/types/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import { BookRecord, db } from '@ink/reader/db'
import {
  locationState,
  navState,
  readerState,
  renditionState,
  settingsState,
} from '@ink/reader/state'

import { Tab } from './Tab'

interface ReaderGroupProps {
  id: string
}
export function ReaderGroup({ id }: ReaderGroupProps) {
  const [book, setBook] = useState<BookRecord>()
  const setId = useSetRecoilState(readerState)

  useEffect(() => {
    db?.books.get(id).then(setBook)
  }, [id])

  return (
    <div className="flex h-full flex-col">
      <Tab.List>
        <Tab selected focused onDelete={() => setId(undefined)}>
          {book?.name}
        </Tab>
      </Tab.List>

      {book && <ReaderPane book={book} />}
    </div>
  )
}

interface NavButtonProps {
  dir: 'left' | 'right'
}
const NavButton: React.FC<NavButtonProps> = ({ dir }) => {
  const left = dir === 'left'
  const rendition = useRecoilValue(renditionState)
  const Icon = left ? MdChevronLeft : MdChevronRight
  return (
    <button
      className={clsx('relative flex flex-1 items-center justify-center')}
      onClick={() => (left ? rendition?.prev() : rendition?.next())}
    >
      <StateLayer />
      <Icon size={40} className="text-outline/30" />
    </button>
  )
}

interface ReaderPaneProps {
  book: BookRecord
}

export function ReaderPane({ book }: ReaderPaneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [, setEpub] = useState<Book>()
  const [rendition, setRendition] = useRecoilState(renditionState)
  const [nav, setNav] = useRecoilState(navState)
  const settings = useRecoilValue(settingsState)
  const { scheme } = useColorScheme()

  useEffect(() => {
    if (!ref.current) return

    const epub = ePub(book.data)
    setEpub((prev) => {
      prev?.destroy()
      return epub
    })
    epub.loaded.navigation.then(setNav)

    const rendition = epub.renderTo(ref.current, {
      width: '100%',
      height: '100%',
    })
    setRendition(rendition)
    rendition.display()
  }, [book.data, setNav, setRendition])

  useEffect(() => {
    rendition?.themes.override('font-size', settings.fontSize + 'px')
    rendition?.themes.override('font-weight', settings.fontWeight + '')
    rendition?.themes.override('line-height', settings.lineHeight + '')
    if (settings.fontFamily)
      rendition?.themes.override('font-family', settings.fontFamily)
  }, [rendition, settings])

  useEffect(() => {
    if (!scheme) return
    const dark = scheme === 'dark'
    rendition?.themes.override('color', dark ? '#bfc8ca' : '#3f484a')
    rendition?.themes.override('background', dark ? '#121212' : 'white')
  }, [rendition, scheme])

  return (
    <>
      {rendition && nav && <ReaderPaneHeader rendition={rendition} nav={nav} />}
      <div ref={ref} className="scroll flex-1" />
      <div className="flex">
        <NavButton dir="left" />
        <NavButton dir="right" />
      </div>
    </>
  )
}

interface ReaderPaneHeaderProps {
  rendition: Rendition
  nav: Navigation
}
export const ReaderPaneHeader: React.FC<ReaderPaneHeaderProps> = ({
  rendition,
  nav,
}) => {
  const [location, setLocation] = useRecoilState(locationState)
  const breadcrumbs = useMemo(() => {
    const crumbs = []
    let navItem = location && nav.get(location?.start.href)

    while (navItem) {
      crumbs.unshift(navItem)
      const parentId = navItem.parent
      if (!parentId) {
        navItem = undefined
      } else {
        // @ts-ignore
        const index = nav.tocById[parentId]
        // @ts-ignore
        navItem = nav.getByIndex(parentId, index, nav.toc)
      }
    }
    return crumbs
  }, [location, nav])

  useEffect(() => {
    rendition.on('relocated', setLocation)
  }, [rendition, setLocation])

  return (
    <div className="typescale-body-small text-outline flex h-6 select-none items-center justify-between px-2">
      <div className="flex">
        {breadcrumbs.map((item, i) => (
          <button key={i} className="hover:text-on-surface flex items-center">
            {item.label}
            {i !== breadcrumbs.length - 1 && <MdChevronRight size={22} />}
          </button>
        ))}
      </div>
      {location && (
        <div>
          {location.start.displayed.page} / {location.start.displayed.total}
        </div>
      )}
    </div>
  )
}
