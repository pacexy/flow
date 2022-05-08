import clsx from 'clsx'
import Head from 'next/head'
import React, { ComponentProps } from 'react'
import { MdClose } from 'react-icons/md'
import { useSnapshot } from 'valtio'

import { DropZone, handleFiles } from '@ink/reader/components/base'

import { IconButton, ReaderGridView, reader } from '../components'
import { db } from '../db'
import { useLibrary } from '../hooks'

export default function Index() {
  const { focusedTab } = useSnapshot(reader)
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
            return (
              <li key={book.id}>
                <Card className="group relative">
                  <Cover
                    role="button"
                    src={book.cover}
                    onClick={() => reader.addTab(book)}
                  />
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

interface CoverProps extends ComponentProps<'img'> {}
const Cover: React.FC<CoverProps> = ({ src, ...props }) => {
  return (
    <img src={src} alt="Cover" className="h-56 object-contain" {...props} />
  )
}
