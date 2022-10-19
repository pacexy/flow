import { Dropbox } from 'dropbox'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

import { BookRecord, db } from './db'
import { readBlob } from './file'

export const mapToToken = {
  dropbox: 'dropbox-refresh-token',
}

export const OAUTH_SUCCESS_MESSAGE = 'oauth_success'

export const dbx = new Dropbox({
  clientId: process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID,
  refreshToken: '__fake_token__',
})
let _req: Promise<void> | undefined
dbx.auth.refreshAccessToken = () => {
  _req ??= fetch(`/api/refresh`)
    .then((res) => res.json())
    .then((data) => {
      dbx.auth.setAccessToken(data.accessToken)
      dbx.auth.setAccessTokenExpiresAt(data.accessTokenExpiresAt)
    })
    .finally(() => {
      // will fail if no refresh token
      _req = undefined
    })
  return _req
}

interface SerializedBooks {
  version: number
  dbVersion: number
  books: BookRecord[]
}

const VERSION = 1
export const DATA_FILENAME = 'data.json'

function serializeData(books?: BookRecord[]) {
  return JSON.stringify({
    version: VERSION,
    dbVersion: db?.verno,
    books,
  })
}

function deserializeData(text: string) {
  const { version, dbVersion, books } = JSON.parse(text) as SerializedBooks

  if (version < VERSION) {
    // migrate `data.json`
  }
  if (db && dbVersion < db.verno) {
    // migrate `BookRecord`
  }

  return books
}

export async function uploadData(books: BookRecord[]) {
  return dbx.filesUpload({
    path: `/${DATA_FILENAME}`,
    mode: { '.tag': 'overwrite' },
    contents: serializeData(books),
  })
}

export const dropboxFilesFetcher = (path: string) => {
  return dbx.filesListFolder({ path }).then((d) => d.result.entries)
}

export const dropboxBooksFetcher = (path: string) => {
  return dbx
    .filesDownload({ path })
    .then((d) => {
      const blob: Blob = (d.result as any).fileBlob
      return readBlob((r) => r.readAsText(blob))
    })
    .then((d) => deserializeData(d))
}

export async function pack() {
  const books = await db?.books.toArray()
  const covers = await db?.covers.toArray()
  const files = await db?.files.toArray()

  const zip = new JSZip()
  zip.file(DATA_FILENAME, serializeData(books))
  zip.file('covers.json', JSON.stringify(covers))

  const folder = zip.folder('files')
  files?.forEach((f) => folder?.file(f.file.name, f.file))

  const date = new Intl.DateTimeFormat('fr-CA').format().replaceAll('-', '')

  return zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, `lota_backup_${date}.zip`)
  })
}

export async function unpack(file: File) {
  const zip = new JSZip()
  await zip.loadAsync(file)

  const booksJSON = zip.file(DATA_FILENAME)
  const coversJSON = zip.file('covers.json')
  if (!booksJSON || !coversJSON) return

  const books = deserializeData(await booksJSON.async('text'))

  db?.books.bulkPut(books)

  const coversText = await coversJSON.async('text')
  db?.covers.bulkPut(JSON.parse(coversText))

  const folder = zip.folder('files')
  folder?.forEach(async (_, f) => {
    const book = books.find((b) => `files/${b.name}` === f.name)
    if (!book) return

    const data = await f.async('blob')
    const file = new File([data], book.name)
    db?.files.put({ file, id: book.id })
  })
}
