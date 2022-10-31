import { useMemo } from 'react'
import { useSnapshot } from 'valtio'

import { BookTab } from '../models'
import { useSettings } from '../state'

function removeUndefinedProperty<T extends Record<string, any>>(obj: T) {
  const newObj: Partial<T> = {}

  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined) {
      newObj[k as keyof T] = v
    }
  })

  return newObj
}

export function useTypography(tab: BookTab) {
  const { book } = useSnapshot(tab)
  const [settings] = useSettings()

  return useMemo(
    () => ({
      ...settings,
      ...removeUndefinedProperty(book.configuration?.typography ?? {}),
    }),
    [book.configuration?.typography, settings],
  )
}
