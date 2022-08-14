import { IS_SERVER } from '@literal-ui/hooks'
import Dexie, { Table } from 'dexie'

export interface FileRecord {
  id: string
  file: File
}

export interface CoverRecord {
  id: string
  cover: string | null
}

export interface BookRecord {
  id: string
  name: string
  createdAt: number
  cfi?: string
  percentage?: number
  definitions: string[]
}

export class DB extends Dexie {
  // 'books' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  files!: Table<FileRecord>
  covers!: Table<CoverRecord>
  books!: Table<BookRecord>

  constructor() {
    super('re_reader')

    this.version(2)
      .stores({
        books: 'id, name, createdAt, cfi, percentage, definitions',
        covers: 'id, cover',
        files: 'id, file',
      })
      .upgrade(async (t) => {
        const books = await t.table('books').toArray()
        ;['covers', 'files'].forEach((tableName) => {
          t.table(tableName)
            .toCollection()
            .modify((r) => {
              const book = books.find((b) => b.name === r.id)
              if (book) r.id = book.id
            })
        })
      })
    this.version(1).stores({
      books: 'id, name, createdAt, cfi, percentage, definitions', // Primary key and indexed props
      covers: 'id, cover',
      files: 'id, file',
    })
  }
}

export const db = IS_SERVER ? null : new DB()
