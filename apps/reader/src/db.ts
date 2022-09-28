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

  constructor(name: string) {
    super(name)

    this.version(2)
      .stores({
        books: 'id, name, createdAt, cfi, percentage, definitions',
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

// https://stackoverflow.com/a/49424051/13151903
async function renameDatabase(sourceName: string, destinationName: string) {
  if (!(await Dexie.exists(sourceName))) return

  // Open source database
  const origDb = new DB(sourceName)
  return origDb.open().then(() => {
    // Create the destination database
    const destDb = new DB(destinationName)

    // Clone Data
    return origDb.tables
      .reduce(
        (prev: Promise<any>, table) =>
          prev
            .then(() => table.toArray())
            .then((rows) => destDb.table(table.name).bulkAdd(rows)),
        Promise.resolve(),
      )
      .then(() => {
        origDb.delete()
        destDb.close()
      })
  })
}

async function prepareDatabase() {
  await renameDatabase('re-reader', 'lota')

  return new DB('lota')
}

export const db = IS_SERVER ? null : await prepareDatabase()
