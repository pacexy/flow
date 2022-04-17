import { StateLayer } from '@literal-ui/core'
import { useColorScheme } from '@literal-ui/hooks'
import clsx from 'clsx'
import ePub, { Book } from 'epubjs'
import { useEffect, useRef, useState } from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import { BookRecord, db } from '@ink/reader/db'
import {
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

      {book && (
        <>
          <div className="typescale-body-small text-outline px-2 py-1">
            BreadCrumbs
          </div>
          <Renderer book={book} />
          <div className="flex">
            <NavButton dir="left" />
            <NavButton dir="right" />
          </div>
        </>
      )}
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

interface RendererProps {
  book: BookRecord
}

export function Renderer({ book }: RendererProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [, setEpub] = useState<Book>()
  const [rendition, setRendition] = useRecoilState(renditionState)
  const setNav = useSetRecoilState(navState)
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

  return <div ref={ref} className="scroll flex-1" />
}
