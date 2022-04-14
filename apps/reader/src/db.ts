import { IS_SERVER } from '@literal-ui/hooks'
import Dexie, { Table } from 'dexie'

export interface Book {
  id: string
  name: string
  data: FileReader['result']
  createdAt: number
}

export class DB extends Dexie {
  // 'books' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  books!: Table<Book>

  constructor() {
    super('ink_reader')
    this.version(1).stores({
      books: 'id, name, data, createdAt', // Primary key and indexed props
    })
  }
}

export const db = IS_SERVER ? null : new DB()
