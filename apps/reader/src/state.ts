import type Navigation from 'epubjs/types/navigation'
import { atom } from 'recoil'

export const navState = atom<Navigation | undefined>({
  key: 'nav',
  default: undefined,
})

export const readerState = atom<string | undefined>({
  key: 'reader',
  default: undefined,
})
