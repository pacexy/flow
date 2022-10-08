import { useBoolean, useEventListener } from '@literal-ui/hooks'
import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdCheckCircle,
  MdOutlineFileDownload,
  MdOutlineShare,
} from 'react-icons/md'
import { useSet } from 'react-use'
import { useSnapshot } from 'valtio'

import {
  ReaderGridView,
  reader,
  Button,
  TextField,
  DropZone,
} from '../components'
import { BookRecord, CoverRecord, db } from '../db'
import { fetchBook, addFile, handleFiles } from '../file'
import {
  useLibrary,
  useMobile,
  useRemoteBooks,
  useRemoteFiles,
  useSubscription,
} from '../hooks'
import { lock } from '../styles'
import { pack } from '../sync'

const placeholder = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="gray" fill-opacity="0" width="1" height="1"/></svg>`

const SOURCE = 'src'

export default function Index() {
  const { focusedTab } = useSnapshot(reader)
  const router = useRouter()
  const src = new URL(window.location.href).searchParams.get(SOURCE)
  const [loading, setLoading] = useState(!!src)

  useEffect(() => {
    let src = router.query[SOURCE]
    if (!src) return
    if (!Array.isArray(src)) src = [src]

    Promise.all(
      src.map((s) =>
        fetchBook(s).then((b) => {
          reader.addTab(b)
        }),
      ),
    ).finally(() => setLoading(false))
  }, [router.query])

  useEffect(() => {
    if ('launchQueue' in window && 'LaunchParams' in window) {
      window.launchQueue.setConsumer((params) => {
        console.log('launchQueue', params)
        if (params.files.length) {
          Promise.all(params.files.map((f) => f.getFile()))
            .then((files) => handleFiles(files))
            .then((books) => books.forEach((b) => reader.addTab(b)))
        }
      })
    }
  }, [])

  useEffect(() => {
    if (router.pathname === '/') reader.clear()
  }, [router.pathname])

  return (
    <>
      <Head>
        <title>{focusedTab?.title ?? 'Lota'}</title>
      </Head>
      <ReaderGridView />
      {loading || <Library />}
    </>
  )
}

export const Library: React.FC = () => {
  const books = useLibrary()
  const covers = useLiveQuery(() => db?.covers.toArray() ?? [])
  const remoteBooks = useRemoteBooks()
  const remoteFiles = useRemoteFiles()
  const usage = remoteFiles.data?.reduce(
    (a, c) => a + (c.metadata as any).size,
    0,
  )

  const exceeded = !!usage && usage > 10 * 1024 ** 3

  const [select, toggleSelect] = useBoolean(false)
  const [selectedBooks, { add, has, toggle, reset }] = useSet<string>()
  const allSelected = selectedBooks.size === books?.length

  const { groups } = useSnapshot(reader)
  const subscription = useSubscription()

  useEffect(() => {
    if (remoteBooks) db?.books.bulkPut(remoteBooks)
  }, [remoteBooks])

  useEffect(() => {
    if (!select) reset()
  }, [reset, select])

  if (groups.length) return null
  return (
    <DropZone
      className="scroll-parent h-full p-4"
      onDrop={(e) => {
        const bookId = e.dataTransfer.getData('text/plain')
        const book = books?.find((b) => b.id === bookId)
        if (book) reader.addTab(book)

        handleFiles(e.dataTransfer.files)
      }}
    >
      <div className="mb-4 space-y-2.5">
        <div>
          <TextField
            name={SOURCE}
            placeholder="https://link.to/remote.epub"
            type="url"
            hideLabel
            actions={[
              {
                title: 'Share',
                Icon: MdOutlineShare,
                onClick(el) {
                  if (el?.reportValidity()) {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/?${SOURCE}=${el.value}`,
                    )
                  }
                },
              },
              {
                title: 'Download',
                Icon: MdOutlineFileDownload,
                onClick(el) {
                  if (el?.reportValidity()) fetchBook(el.value)
                },
              },
            ]}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="space-x-2">
            {books?.length ? (
              <Button variant="secondary" onClick={toggleSelect}>
                {select ? 'Cancel' : 'Select'}
              </Button>
            ) : (
              <Button
                variant="secondary"
                disabled={!books}
                onClick={() => {
                  fetchBook(
                    'https://epubtest.org/books/Fundamental-Accessibility-Tests-Basic-Functionality-v1.0.0.epub',
                  )
                }}
              >
                Download sample book
              </Button>
            )}
            {select &&
              (allSelected ? (
                <Button variant="secondary" onClick={reset}>
                  Deselect all
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => books?.forEach((b) => add(b.id))}
                >
                  Select all
                </Button>
              ))}
          </div>

          <div className="space-x-2">
            {select ? (
              <>
                <Button
                  disabled={subscription?.status !== 'active' || exceeded}
                  onClick={() => {
                    toggleSelect()
                    const event = new Event('upload')
                    window.dispatchEvent(event)
                  }}
                >
                  Upload
                </Button>
                <Button
                  onClick={() => {
                    toggleSelect()
                    selectedBooks.forEach(async (id) => {
                      db?.files.delete(id)
                      db?.covers.delete(id)
                      db?.books.delete(id)

                      await supabaseClient.from('Book').delete().eq('id', id)
                      supabaseClient.storage
                        .from('books')
                        .remove([`${subscription?.email}/${id}`])
                    })
                  }}
                >
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  disabled={!books?.length}
                  onClick={pack}
                >
                  Export
                </Button>
                <Button className="relative">
                  <input
                    type="file"
                    accept="application/epub+zip,application/epub,application/zip"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => {
                      const files = e.target.files
                      if (files) handleFiles(files)
                    }}
                  />
                  Import
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="scroll h-full">
        <ul
          className="grid"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(calc(80px + 3vw), 1fr))`,
            columnGap: lock(16, 32),
            rowGap: lock(24, 40),
          }}
        >
          {books?.map((book) => (
            <Book
              key={book.id}
              book={book}
              covers={covers}
              select={select}
              selected={has(book.id)}
              toggle={toggle}
            />
          ))}
        </ul>
      </div>
    </DropZone>
  )
}

interface BookProps {
  book: BookRecord
  covers?: CoverRecord[]
  select?: boolean
  selected?: boolean
  toggle: (id: string) => void
}
export const Book: React.FC<BookProps> = ({
  book,
  covers,
  select,
  selected,
  toggle,
}) => {
  const remoteFiles = useRemoteFiles()
  const subscription = useSubscription()
  const router = useRouter()
  const mobile = useMobile()
  const [loading, setLoading] = useState(false)

  const cover = covers?.find((c) => c.id === book.id)?.cover
  const remoteFile = remoteFiles.data?.find((f) => f.name === book.id)

  useEffect(() => {
    if (!remoteFile) return
    db?.files.get(book.id).then((file) => {
      if (file) return
      setLoading(true)
      supabaseClient.storage
        .from('books')
        .download(`${subscription?.email}/${book.id}`)
        .then(({ data }) => {
          if (data) addFile(book.id, new File([data], book.name))
          setLoading(false)
        })
    })
  }, [book, remoteFile, subscription])

  useEventListener<any>('upload', async () => {
    if (loading) return
    if (!selected) return
    if (remoteFiles.data?.find((f) => f.name === book.id)) return

    const file = await db?.files.get(book.id)
    if (!file) return

    setLoading(true)
    const owner = subscription?.email
    supabaseClient.storage
      .from('books')
      .upload(`${owner}/${book.id}`, file.file)
      .then(() => supabaseClient.from('Book').upsert({ ...book, owner }))
      .then(() => {
        remoteFiles.mutate()
        setLoading(false)
      })
  })

  const Icon = selected ? MdCheckBox : MdCheckBoxOutlineBlank

  return (
    <div className="relative flex flex-col">
      <div
        role="button"
        className="border-inverse-on-surface relative border"
        onClick={async () => {
          if (select) {
            toggle(book.id)
          } else {
            if (mobile) await router.push('/_')
            reader.addTab(book)
          }
        }}
      >
        <div
          className={clsx(
            'absolute bottom-0 h-1 bg-blue-500',
            loading && 'progress-bit w-[5%]',
          )}
        />
        {book.percentage !== undefined && (
          <div className="typescale-body-large absolute right-0 bg-gray-500/60 px-2 text-gray-100">
            {(book.percentage * 100).toFixed()}%
          </div>
        )}
        <img
          src={cover ?? placeholder}
          alt="Cover"
          className="mx-auto aspect-[9/12] object-cover"
          draggable={false}
        />
        {select && (
          <div className="absolute bottom-1 right-1">
            <Icon
              size={24}
              className={clsx(
                '-m-1',
                selected ? 'text-tertiary' : 'text-outline',
              )}
            />
          </div>
        )}
      </div>

      <div
        className="line-clamp-2 text-on-surface-variant typescale-body-small lg:typescale-body-medium mt-2 w-full"
        title={book.name}
      >
        <MdCheckCircle
          className={clsx(
            'mr-1 mb-0.5 inline',
            remoteFile ? 'text-tertiary' : 'text-surface-variant',
          )}
          size={16}
        />
        {book.name}
      </div>
    </div>
  )
}
