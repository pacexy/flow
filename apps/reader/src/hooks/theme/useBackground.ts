import { useCallback, useMemo } from 'react'

import { useSettings } from '@ink/reader/state'

import { useColorScheme } from './useColorScheme'

export function useBackground() {
  const [{ theme }, setSettings] = useSettings()
  const { dark } = useColorScheme()

  const setBackground = useCallback(
    (background: number) => {
      setSettings((prev) => ({
        ...prev,
        theme: {
          ...prev.theme,
          background,
        },
      }))
    },
    [setSettings],
  )

  const background = useMemo(() => {
    // [-1, 1, 3, 5]
    const level = theme?.background ?? -1

    if (dark) return 'bg-default'

    if (level > 0) return `bg-surface${level}`

    return 'bg-default'
  }, [dark, theme?.background])

  return [background, setBackground] as const
}
