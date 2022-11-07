import { useMediaQuery } from '@literal-ui/hooks'
import { useEffect } from 'react'
import useLocalStorageState from 'use-local-storage-state'

export type ColorScheme = 'light' | 'dark' | 'system'

const background = {
  light: 'white',
  dark: '#24292e',
}

export function useColorScheme() {
  const [scheme, setScheme] = useLocalStorageState<ColorScheme>(
    'literal-color-scheme',
    { defaultValue: 'system' },
  )

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const dark = scheme === 'dark' || (scheme === 'system' && prefersDark)

  useEffect(() => {
    if (dark !== undefined) {
      document.documentElement.classList.toggle('dark', dark)
      document
        .querySelector('#theme-color')
        ?.setAttribute('content', dark ? background.dark : background.light)
    }
  }, [dark])

  return { scheme, dark, setScheme }
}
