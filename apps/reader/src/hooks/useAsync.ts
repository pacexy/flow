import { useState } from 'react'

export function useAsync<T>(func: () => Promise<T>) {
  const [value, setValue] = useState<T>()
  func().then(setValue)
  return value
}
