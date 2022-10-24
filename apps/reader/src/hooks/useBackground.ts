import { useCallback, useMemo } from 'react'

import { useSettings } from '../state'

import { useColorScheme } from './useColorScheme'

export function useBackground() {
  const [{ theme }] = useSettings()
  const [, setSettings] = useSettings()
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
    const level = theme?.background

    if (dark) return 'bg-default'

    if (!level) return 'bg-surface'

    if (level > 0) return `bg-surface${level}`

    return 'bg-default'
  }, [dark, theme?.background])

  return [background, setBackground] as const
}
