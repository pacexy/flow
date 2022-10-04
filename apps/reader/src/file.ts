import ePub, { Book } from 'epubjs'
import { v4 as uuidv4 } from 'uuid'

import { db } from './db'

export async function fileToEpub(file: File) {
  const data = await file.arrayBuffer()
  return ePub(data)
}

export async function handleFiles(files: Iterable<File>) {
  const books = await db?.books.toArray()
  const newBooks = []

  for (const file of files) {
    console.log(file)

    if (!['application/epub+zip', 'application/epub'].includes(file.type)) {
      console.error(`Unsupported file type: ${file.type}`)
      continue
    }

    let book = books?.find((b) => b.name === file.name)

    if (!book) {
      book = await addBook(file)
    }

    newBooks.push(book)
  }

  return newBooks
}

export async function addBook(file: File) {
  const epub = await fileToEpub(file)
  const metadata = await epub.loaded.metadata

  const book = {
    id: uuidv4(),
    name: file.name || `${metadata.title}.epub`,
    size: file.size,
    metadata,
    createdAt: Date.now(),
    definitions: [],
  }
  db?.books.add(book)
  addFile(book.id, file, epub)
  return book
}

export async function addFile(id: string, file: File, epub?: Book) {
  db?.files.add({ id, file })

  if (!epub) {
    epub = await fileToEpub(file)
  }

  const url = await epub.coverUrl()
  const cover = url && (await toDataUrl(url))
  db?.covers.add({ id, cover })
}

async function toDataUrl(url: string) {
  const res = await fetch(url)
  const buffer = await res.blob()

  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      resolve(reader.result as string)
    })
    reader.readAsDataURL(buffer)
  })
}

export function fetchBook(url: string) {
  return fetch(url)
    .then((res) => res.blob())
    .then((blob) =>
      addBook(new File([blob], /\/([^/]*\.epub)$/i.exec(url)?.[1] ?? '')),
    )
}
