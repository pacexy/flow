import { useMediaQuery } from '@literal-ui/hooks'
import { useEffect } from 'react'
import useLocalStorageState from 'use-local-storage-state'

export type ColorScheme = 'light' | 'dark' | 'system'

export function useColorScheme() {
  const [scheme, setScheme] = useLocalStorageState<ColorScheme>(
    'literal-color-scheme',
    { defaultValue: 'system' },
  )

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const dark = scheme === 'dark' || (scheme === 'system' && prefersDark)

  useEffect(() => {
    if (dark !== undefined)
      document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return { scheme, dark, setScheme }
}
