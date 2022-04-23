import type { Rendition, Location } from 'epubjs'
import type Navigation from 'epubjs/types/navigation'
import { atom, AtomEffect } from 'recoil'

function localStorageEffect<T>(key: string): AtomEffect<T> {
  return ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue))
    }

    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue))
    })
  }
}

export const navState = atom<Navigation | undefined>({
  key: 'nav',
  default: undefined,
})

export const locationState = atom<Location | undefined>({
  key: 'location',
  default: undefined,
})

export const renditionState = atom<Rendition | undefined>({
  key: 'rendition',
  default: undefined,
  dangerouslyAllowMutability: true,
})

export const readerState = atom<string[]>({
  key: 'reader',
  default: [],
})

export type Action = 'TOC' | 'Search' | 'Typography'
export const actionState = atom<Action | undefined>({
  key: 'action',
  default: 'TOC',
})

type Settings = {
  fontSize: number
  fontWeight: number
  fontFamily?: string
  lineHeight: number
}

export const settingsState = atom<Settings>({
  key: 'settings',
  default: {
    //typography
    fontSize: 18,
    fontWeight: 400,
    fontFamily: undefined,
    lineHeight: 1.5,
  },
  effects: [localStorageEffect('settings')],
})
