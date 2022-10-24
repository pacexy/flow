import { useCallback } from 'react'

import { useSettings } from '@ink/reader/state'

export function useSourceColor() {
  const [{ theme }, setSettings] = useSettings()

  const setSourceColor = useCallback(
    (source: string) => {
      setSettings((prev) => ({
        ...prev,
        theme: {
          ...prev.theme,
          source,
        },
      }))
    },
    [setSettings],
  )

  return { sourceColor: theme?.source ?? '#0ea5e9', setSourceColor }
}
