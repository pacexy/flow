import { useRouter } from 'next/router'
import { useCallback } from 'react'

import locales from '../../locales'

export function useTranslation(scope?: string) {
  const { locale } = useRouter()

  return useCallback(
    (key: string) => {
      // @ts-ignore
      return locales[locale][scope ? `${scope}.${key}` : key] as string
    },
    [locale, scope],
  )
}
