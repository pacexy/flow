import { IS_SERVER } from '@literal-ui/hooks'
import { atom, AtomEffect, useRecoilState } from 'recoil'

import { RenditionSpread } from '@flow/epubjs/types/rendition'

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

export const navbarState = atom<boolean>({
  key: 'navbar',
  default: false,
})

export interface Settings extends TypographyConfiguration {
  theme?: ThemeConfiguration
  enableTextSelectionMenu?: boolean
}

export interface AIConfig {
  apiKey?: string
  apiUrl?: string
  modelName?: string
  translatePrompt?: string
  summarizePrompt?: string
}

export const defaultAIConfig: AIConfig = {
  apiKey: '',
  apiUrl: 'https://api.openai.com/v1',
  modelName: 'gpt-3.5-turbo',
  translatePrompt: '请将以下文本翻译成中文，保持原文的格式和风格：',
  summarizePrompt: '请总结以下文本的主要内容，要求简洁明了：',
}

const aiConfigState = atom<AIConfig>({
  key: 'aiConfig',
  default: defaultAIConfig,
  effects: [localStorageEffect('aiConfig', defaultAIConfig)],
})

export { aiConfigState }

export interface TypographyConfiguration {
  fontSize?: string
  fontWeight?: number
  fontFamily?: string
  lineHeight?: number
  spread?: RenditionSpread
  zoom?: number
}

interface ThemeConfiguration {
  source?: string
  background?: number
}

export const defaultSettings: Settings = {}

const settingsState = atom<Settings>({
  key: 'settings',
  default: defaultSettings,
  effects: [localStorageEffect('settings', defaultSettings)],
})

export function useSettings() {
  return useRecoilState(settingsState)
}
