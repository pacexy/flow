import { IS_SERVER } from '@literal-ui/hooks'
import { atom, AtomEffect } from 'recoil'

function localStorageEffect<T>(key: string, defaultValue: T): AtomEffect<T> {
  return ({ setSelf, onSet }) => {
    if (IS_SERVER) return

    const savedValue = localStorage.getItem(key)
    if (savedValue === null) {
      localStorage.setItem(key, JSON.stringify(defaultValue))
    } else {
      setSelf(JSON.parse(savedValue))
    }

    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue))
    })
  }
}

export type Action = 'TOC' | 'Search' | 'Annotation' | 'Typography' | 'Image'
export const actionState = atom<Action | undefined>({
  key: 'action',
  default: 'TOC',
})

export type Settings = {
  fontSize: string
  fontWeight: number
  fontFamily?: string
  lineHeight: number
}

const defaultSettings = {
  //typography
  fontSize: '18px',
  fontWeight: 400,
  lineHeight: 1.5,
}

export const settingsState = atom<Settings>({
  key: 'settings',
  default: defaultSettings,
  effects: [localStorageEffect('settings', defaultSettings)],
})
