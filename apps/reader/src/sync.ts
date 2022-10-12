import { Dropbox } from 'dropbox'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { parseCookies } from 'nookies'

import { BookRecord, db } from './db'

export const mapToToken = {
  dropbox: 'dropbox-refresh-token',
}

export const OAUTH_SUCCESS_MESSAGE = 'oauth_success'

const cookies = parseCookies()
const refreshToken = cookies[mapToToken['dropbox']]
export const dbx = new Dropbox({
  clientId: process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID,
  refreshToken,
})
dbx.auth.refreshAccessToken = () => {
  fetch(`/api/refresh?token=${refreshToken}`)
    .then((res) => res.json())
    .then((data) => {
      dbx.auth.setAccessToken(data.accessToken)
      dbx.auth.setAccessTokenExpiresAt(data.accessTokenExpiresAt)
    })
}
// generate access token first to avoid to block subsequent requests
dbx.auth.refreshAccessToken()

export async function pack() {
  const books = await db?.books.toArray()
  const covers = await db?.covers.toArray()
  const files = await db?.files.toArray()

  const zip = new JSZip()
  zip.file('books.json', JSON.stringify(books))
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

  const booksJSON = zip.file('books.json')
  const coversJSON = zip.file('covers.json')
  if (!booksJSON || !coversJSON) return

  const booksText = await booksJSON.async('text')
  const books: BookRecord[] = JSON.parse(booksText)
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
