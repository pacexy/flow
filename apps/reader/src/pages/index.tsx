import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import Head from 'next/head'
import React, { ComponentProps, useEffect } from 'react'
import { MdClose } from 'react-icons/md'
import { useSnapshot } from 'valtio'

import { DropZone, handleFiles } from '@ink/reader/components/base'

import { IconButton, ReaderGridView, reader } from '../components'
import { db } from '../db'
import { useLibrary } from '../hooks'

const placeholder = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="gray" fill-opacity="0" width="1" height="1"/></svg>`

export default function Index() {
  const { focusedTab } = useSnapshot(reader)

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
        <title>{focusedTab?.book.name ?? 'reReader'}</title>
      </Head>
      <ReaderGridView />
      <Library />
    </>
  )
}

export const Library: React.FC = () => {
  const books = useLibrary()
  const covers = useLiveQuery(() => db?.covers.toArray() ?? [])
  const { groups } = useSnapshot(reader)
  if (groups.length) return null
  return (
    <DropZone
      onDrop={(e) => {
        const bookId = e.dataTransfer.getData('text/plain')
        const book = books?.find((b) => b.id === bookId)
        if (book) reader.addTab(book)
      }}
    >
      <div className="scroll h-full p-4">
        <ul
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(224px, 1fr))`,
          }}
        >
          {books?.map((book) => {
            const cover = covers?.find((c) => c.id === book.name)?.cover
            return (
              <li key={book.id}>
                <Card className="group relative">
                  <div className="relative">
                    {book.percentage !== undefined && (
                      <div className="typescale-body-large absolute right-0 bg-gray-500/60 px-2 text-gray-100">
                        {(book.percentage * 100).toFixed()}%
                      </div>
                    )}
                    <img
                      role="button"
                      src={cover ?? placeholder}
                      onClick={() => reader.addTab(book)}
                      alt="Cover"
                      className="h-56 object-contain"
                    />
                  </div>

                  <div
                    className="line-clamp-2 text-on-surface-variant typescale-body-large mt-4 w-full"
                    title={book.name}
                  >
                    {book.name}
                  </div>
                  <IconButton
                    className="!absolute right-1 top-1 hidden group-hover:block"
                    size={20}
                    Icon={MdClose}
                    onClick={() => {
                      db?.files.delete(book.name)
                      db?.covers.delete(book.name)
                      db?.books.delete(book.id)
                    }}
                  />
                </Card>
              </li>
            )
          })}

          <Card className="relative">
            <input
              type="file"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => {
                const files = e.target.files
                if (files) handleFiles(files)
              }}
            />
            Add book
          </Card>
        </ul>
      </div>
    </DropZone>
  )
}

interface CardProps extends ComponentProps<'div'> {}
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-outline/5 flex h-80 flex-col items-center justify-center rounded p-4',
        className,
      )}
      {...props}
    />
  )
}
