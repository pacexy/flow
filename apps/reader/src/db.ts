import { IS_SERVER } from '@literal-ui/hooks'
import Dexie, { Table } from 'dexie'

import { PackagingMetadataObject } from '@ink/epubjs/types/packaging'

import { Annotation } from './annotation'
import { fileToEpub } from './file'
import { TypographyConfiguration } from './state'

export interface FileRecord {
  id: string
  file: File
}

export interface CoverRecord {
  id: string
  cover: string | null
}

export interface BookRecord {
  // TODO: use file hash as id
  id: string
  name: string
  size: number
  metadata: PackagingMetadataObject
  createdAt: number
  updatedAt?: number
  cfi?: string
  percentage?: number
  definitions: string[]
  annotations: Annotation[]
  configuration?: {
    typography?: TypographyConfiguration
  }
}

export class DB extends Dexie {
  // 'books' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  files!: Table<FileRecord>
  covers!: Table<CoverRecord>
  books!: Table<BookRecord>

  constructor(name: string) {
    super(name)

    this.version(4)
      .stores({
        books:
          'id, name, size, metadata, createdAt, updatedAt, cfi, percentage, definitions, annotations',
      })
      .upgrade(async (t) => {
        t.table('books')
          .toCollection()
          .modify((r) => {
            r.annotations = []
          })
      })

    this.version(3)
      .stores({
        books:
          'id, name, size, metadata, createdAt, updatedAt, cfi, percentage, definitions',
      })
      .upgrade(async (t) => {
        const files = await t.table('files').toArray()

        const metadatas = await Dexie.waitFor(
          Promise.all(
            files.map(async ({ file }) => {
              const epub = await fileToEpub(file)
              return epub.loaded.metadata
            }),
          ),
        )

        return t
          .table('books')
          .toCollection()
          .modify(async (r) => {
            const i = files.findIndex((f) => f.id === r.id)
            r.metadata = metadatas[i]
            r.size = files[i].file.size
          })
          .catch((e) => {
            console.error(e)
            throw e
          })
      })
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

export const db = IS_SERVER ? null : new DB('re-reader')
