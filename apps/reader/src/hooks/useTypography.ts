import { useMemo } from 'react'

import { useReaderSnapshot } from '../models'
import { useSettings, defaultSettings } from '../state'

export function useTypography() {
  const { focusedBookTab } = useReaderSnapshot()
  const [settings] = useSettings()

  return useMemo(
    () => ({
      ...settings,
      ...(focusedBookTab?.book.configuration?.typography ?? defaultSettings),
    }),
    [focusedBookTab?.book.configuration?.typography, settings],
  )
}
