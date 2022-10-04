import ePub from 'epubjs'

export async function fileToEpub(file: File) {
  const data = await file.arrayBuffer()
  return ePub(data)
}
