import ePub from 'epubjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSetRecoilState } from 'recoil'

import { Book, db } from '@ink/reader/db'
import { navState } from '@ink/reader/state'

interface ReaderProps {
  id: string
}
export function Reader({ id }: ReaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [book, setBook] = useState<Book>()
  const setNav = useSetRecoilState(navState)
  const epub = useMemo(() => {
    return book && ePub(book.data)
  }, [book])

  useEffect(() => {
    if (id) db?.books.get(id).then(setBook)
  }, [id])

  useEffect(() => {
    if (ref.current && epub) {
      const rendition = epub.renderTo(ref.current, {
        flow: 'auto',
        width: '900',
        height: '600',
      })
      rendition.display()
    }
  }, [epub])

  useEffect(() => {
    epub?.loaded.navigation.then((nav) => {
      setNav(nav)
    })
  }, [epub, setNav])

  return <div ref={ref}></div>
}
