import { useRouter } from 'next/router'
import { useCallback } from 'react'

import locales from '../../locales'

export function useTranslation(scope?: string) {
  const { locale: originalLocale } = useRouter()
  const isExport = process.env.NEXT_PUBLIC_IS_EXPORT === 'true'
  const locale = isExport ? 'en-US' : originalLocale

  return useCallback(
    (key: string) => {
      if (!locale) {
        return ''
      }
      // @ts-ignore
      const translation = locales[locale][scope ? `${scope}.${key}` : key]
      return (translation as string) ?? ''
    },
    [locale, scope],
  )
}
