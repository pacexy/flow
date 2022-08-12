import { useBoolean } from '@literal-ui/hooks'
import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import Head from 'next/head'
import React, { useEffect } from 'react'
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdCheckCircle,
} from 'react-icons/md'
import { useSet } from 'react-use'
import { useSnapshot } from 'valtio'

import { addFile, DropZone, handleFiles } from '@ink/reader/components/base'

import { ReaderGridView, reader, Button, Account } from '../components'
import { BookRecord, CoverRecord, db } from '../db'
import {
  useLibrary,
  useRemoteBooks,
  useRemoteFiles,
  useSubscription,
} from '../hooks'
import { lock } from '../styles'

const placeholder = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="gray" fill-opacity="0" width="1" height="1"/></svg>`

export default function Index() {
  const { focusedBookTab } = useSnapshot(reader)

  useEffect(() => {
    if ('launchQueue' in window && 'LaunchParams' in window) {
      window.launchQueue.setConsumer((params) => {
        console.log('launchQueue', params)
        if (params.files.length) {
          Promise.all(params.files.map((f) => f.getFile())).then((files) =>
            handleFiles(files, true),
          )
        }
      })
    }
  }, [])

  return (
    <>
      <Head>
        <title>{focusedBookTab?.book.name ?? 'reReader'}</title>
      </Head>
      <ReaderGridView />
      <Library />
    </>
  )
}

export const Library: React.FC = () => {
  const books = useLibrary()
  const covers = useLiveQuery(() => db?.covers.toArray() ?? [])
  const remoteBooks = useRemoteBooks()
  const remoteFiles = useRemoteFiles()

  const [select, toggleSelect] = useBoolean(false)
  const [selectedBooks, { add, has, toggle, reset }] = useSet<string>()
  const allSelected = selectedBooks.size === books?.length

  const { groups } = useSnapshot(reader)
  const subscription = useSubscription()

  useEffect(() => {
    remoteBooks?.forEach((b) => {
      db?.books.put(b)
    })
  }, [remoteBooks, subscription])

  if (groups.length) return null
  return (
    <DropZone
      className="scroll-parent h-full"
      onDrop={(e) => {
        const bookId = e.dataTransfer.getData('text/plain')
        const book = books?.find((b) => b.id === bookId)
        if (book) reader.addTab(book)
      }}
    >
      <div className="flex justify-between p-4">
        <div className="space-x-4">
          {!!books?.length && (
            <Button variant="secondary" onClick={toggleSelect}>
              {select ? 'Cancel' : 'Select'}
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
        <div className="space-x-4">
          {select ? (
            <>
              <Button
                onClick={() => {
                  toggleSelect()
                  if (subscription?.status !== 'active') {
                    return reader.addTab(Account)
                  }
                  selectedBooks.forEach(async (id) => {
                    if (remoteFiles?.find((f) => f.name === id)) return

                    const file = await db?.files.get(id)
                    if (!file) return

                    const book = books?.find((b) => b.id === id)
                    const owner = subscription?.email
                    await supabaseClient.from('Book').upsert({ ...book, owner })
                    supabaseClient.storage
                      .from('books')
                      .upload(`${owner}/${id}`, file.file)
                  })
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
            <Button className="relative">
              <input
                type="file"
                accept="application/epub+zip"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => {
                  const files = e.target.files
                  if (files) handleFiles(files)
                }}
              />
              Import
            </Button>
          )}
        </div>
      </div>
      <div className="scroll h-full p-4">
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

  const cover = covers?.find((c) => c.id === book.id)?.cover
  const remoteFile = remoteFiles?.find((f) => f.name === book.id)

  useEffect(() => {
    if (!remoteFile) return
    db?.files.get(book.id).then((file) => {
      if (file) return
      supabaseClient.storage
        .from('books')
        .download(`${subscription?.email}/${book.id}`)
        .then(({ data }) => {
          if (data) addFile(book.id, new File([data], book.name))
        })
    })
  }, [book, remoteFile, subscription])

  const Icon = selected ? MdCheckBox : MdCheckBoxOutlineBlank

  return (
    <div className="relative flex flex-col">
      <div
        role="button"
        className="border-inverse-on-surface relative border"
        onClick={() => (select ? toggle(book.id) : reader.addTab(book))}
      >
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
        {remoteFile && (
          <MdCheckCircle
            className="text-outline/60 mr-1 mb-0.5 inline"
            size={16}
          />
        )}
        {book.name}
      </div>
    </div>
  )
}
