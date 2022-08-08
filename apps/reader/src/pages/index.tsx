import { useBoolean } from '@literal-ui/hooks'
import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import Head from 'next/head'
import React, { ComponentProps, useEffect } from 'react'
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdCheckCircle,
} from 'react-icons/md'
import { useSet } from 'react-use'
import { useSnapshot } from 'valtio'

import { addFile, DropZone, handleFiles } from '@ink/reader/components/base'

import { ReaderGridView, reader, Button } from '../components'
import { BookRecord, CoverRecord, db } from '../db'
import {
  useLibrary,
  useRemoteBooks,
  useRemoteFiles,
  useSubscription,
} from '../hooks'

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
          <Button variant="secondary" onClick={toggleSelect}>
            {select ? 'Cancel' : 'Select'}
          </Button>
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
              <Button onClick={() => {}}>Upload</Button>
              <Button
                onClick={() => {
                  selectedBooks.forEach((id) => {
                    db?.files.delete(id)
                    db?.covers.delete(id)
                    db?.books.delete(id)
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
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(224px, 1fr))`,
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

  const cover = covers?.find((c) => c.id === book.name)?.cover
  const remoteFile = remoteFiles?.find((f) => f.name.startsWith(book.id))

  useEffect(() => {
    if (!remoteFile) return
    db?.files.get(book.name).then((file) => {
      if (file) return
      supabaseClient.storage
        .from('books')
        .download(`${subscription?.email}/${book.id}.epub`)
        .then(({ data }) => {
          if (data) addFile(new File([data], book.name))
        })
    })
  }, [book, remoteFile, subscription])

  const Icon = selected ? MdCheckBox : MdCheckBoxOutlineBlank

  return (
    <Card className="relative">
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
          className="mx-auto h-56 object-contain"
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
        className="line-clamp-2 text-on-surface-variant typescale-body-medium mt-4 w-full"
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
    </Card>
  )
}

interface CardProps extends ComponentProps<'div'> {}
export function Card({ className, ...props }: CardProps) {
  return (
    <div className={clsx('flex h-80 flex-col p-4', className)} {...props} />
  )
}
