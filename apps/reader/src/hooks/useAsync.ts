import { useEffect, useRef, useState } from 'react'

export function useAsync<T>(
  func: () => Promise<T> | undefined | null,
  deps = [],
) {
  const ref = useRef(func)
  ref.current = func
  const [value, setValue] = useState<T>()

  useEffect(() => {
    ref.current()?.then(setValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return value
}
