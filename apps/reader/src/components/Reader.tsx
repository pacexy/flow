import { StateLayer } from '@literal-ui/core'
import clsx from 'clsx'
import ePub, { Book } from 'epubjs'
import { useEffect, useRef, useState } from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import { BookRecord, db } from '@ink/reader/db'
import { navState, readerState, renditionState } from '@ink/reader/state'

import { Tab } from './Tab'

interface ReaderProps {
  id: string
}
export function Reader({ id }: ReaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [book, setBook] = useState<BookRecord>()
  const [epub, setEpub] = useState<Book>()
  const setRendition = useSetRecoilState(renditionState)
  const setNav = useSetRecoilState(navState)
  const setId = useSetRecoilState(readerState)

  useEffect(() => {
    db?.books.get(id).then((book) => {
      if (!ref.current || !book) return
      setBook(book)

      const epub = ePub(book.data)
      setEpub(epub)
      epub.loaded.navigation.then(setNav)

      const rendition = epub.renderTo(ref.current, {
        spread: 'always',
        width: '100%',
        height: '100%',
      })
      setRendition(rendition)
      rendition.display()
      rendition.themes.font('sans-serif')
      rendition.themes.fontSize('20px')
    })
  }, [id, setNav, setRendition])

  useEffect(() => {
    return () => epub?.destroy()
  }, [epub])

  return (
    <div className="flex h-full flex-col">
      <Tab.List>
        <Tab selected focused onDelete={() => setId(undefined)}>
          {book?.name}
        </Tab>
      </Tab.List>
      <div className="typescale-body-small text-outline px-2 py-1">
        BreadCrumbs
      </div>
      <div ref={ref} className="flex-1"></div>
      <div className="flex">
        <NavButton dir="left" />
        <NavButton dir="right" />
      </div>
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
