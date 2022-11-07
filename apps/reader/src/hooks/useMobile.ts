import { useEffect } from 'react'
import { atom, useRecoilState } from 'recoil'

export const mobileState = atom<boolean | undefined>({
  key: 'mobile',
  default: undefined,
})

let listened = false

export function useMobile() {
  const [mobile, setMobile] = useRecoilState(mobileState)

  useEffect(() => {
    if (listened) return
    listened = true

    const mq = window.matchMedia('(max-width: 640px)')
    setMobile(mq.matches)
    mq.addEventListener('change', (e) => {
      setMobile(e.matches)
    })
  }, [setMobile])

  return mobile
}
