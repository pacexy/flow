import en_US from '../locales/en-US'
import ja_JP from '../locales/ja-JP'
import zh_CN from '../locales/zh-CN'
import de_DE from '../locales/de-DE'

// Locale display names
export const localeNames: Record<string, string> = {
  'en-US': 'English',
  'zh-CN': '简体中文',
  'ja-JP': '日本語',
  'de-DE': 'Deutsch',
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  'en-US': en_US,
  'zh-CN': zh_CN,
  'ja-JP': ja_JP,
  'de-DE': de_DE,
} as const
