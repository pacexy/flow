import { IS_SERVER } from '@literal-ui/hooks'
import Dexie, { Table } from 'dexie'

export interface BookRecord {
  id: string
  name: string
  data: ArrayBuffer
  createdAt: number
  cover: string
}

export class DB extends Dexie {
  // 'books' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  books!: Table<BookRecord>

  constructor() {
    super('ink_reader')
    this.version(1).stores({
      books: 'id, name, data, createdAt, cover', // Primary key and indexed props
    })
  }
}

export const db = IS_SERVER ? null : new DB()
