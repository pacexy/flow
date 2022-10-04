import ePub from 'epubjs'

import { addBook } from './components'

export async function fileToEpub(file: File) {
  const data = await file.arrayBuffer()
  return ePub(data)
}

export function fetchBook(url: string) {
  return fetch(url)
    .then((res) => res.blob())
    .then((blob) => addBook(new File([blob], '')))
}
