import { IS_SERVER } from '@literal-ui/hooks'
import { RenditionSpread } from 'packages/epub.js/types/rendition'
import { atom, AtomEffect, useRecoilState } from 'recoil'

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

export type Action =
  | 'TOC'
  | 'Search'
  | 'Annotation'
  | 'Typography'
  | 'Image'
  | 'Timeline'
  | 'Theme'
export const actionState = atom<Action | undefined>({
  key: 'action',
  default: undefined,
})

export const navbarState = atom<boolean>({
  key: 'navbar',
  default: false,
})

export type Settings = {
  fontSize?: string
  fontWeight?: number
  fontFamily?: string
  lineHeight?: number
  spread?: RenditionSpread
  zoom?: number
  theme?: Partial<{
    source: string
    background: number
  }>
}

const defaultSettings: Settings = {}

const settingsState = atom<Settings>({
  key: 'settings',
  default: defaultSettings,
  effects: [localStorageEffect('settings', defaultSettings)],
})

export function useSettings() {
  return useRecoilState(settingsState)
}
