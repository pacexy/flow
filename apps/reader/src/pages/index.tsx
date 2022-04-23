import clsx from 'clsx'
import epub, { Book } from 'epubjs'
import React, { ComponentProps } from 'react'
import { MdClose } from 'react-icons/md'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import { DropZone, SplitView } from '@ink/reader/components/base'

import { IconButton, ReaderGroup } from '../components'
import { db } from '../db'
import { useAsync, useLibrary } from '../hooks'
import { readerState } from '../state'

export default function Index() {
  const bookIds = useRecoilValue(readerState)
  return bookIds.length ? (
    <SplitView>
      <ReaderGroup bookIds={bookIds} />
    </SplitView>
  ) : (
    <DropZone>
      <Library />
    </DropZone>
  )
}

export const Library: React.FC = () => {
  const books = useLibrary()
  const setBookIds = useSetRecoilState(readerState)

  return (
    <div className="scroll h-full p-4">
      <ul
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(224px, 1fr))`,
        }}
      >
        {books?.map(({ id, data, name }) => {
          const book = epub(data)

          return (
            <li key={id}>
              <Card className="group relative">
                <Cover
                  role="button"
                  book={book}
                  onClick={() => setBookIds([id])}
                />
                <div
                  className="line-clamp-2 text-on-surface-variant typescale-body-large mt-4 w-full"
                  title={name}
                >
                  {name}
                </div>
                <IconButton
                  className="!absolute right-1 top-1 hidden group-hover:block"
                  size={20}
                  Icon={MdClose}
                  onClick={() => {
                    db?.books.delete(id)
                  }}
                />
              </Card>
            </li>
          )
        })}

        <Card>Add book</Card>
      </ul>
    </div>
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

interface CoverProps extends ComponentProps<'img'> {
  book: Book
}
const Cover: React.FC<CoverProps> = ({ book, ...props }) => {
  const src = useAsync(() => book.coverUrl())

  return (
    <img
      src={src ?? undefined}
      alt="Cover"
      className="h-56 object-contain"
      {...props}
    />
  )
}
