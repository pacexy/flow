import { useMobile } from './useMobile'

export enum ENV {
  Desktop = 1,
  MOBILE = 1 << 1,
}

export function useEnv() {
  const mobile = useMobile()
  return mobile ? ENV.MOBILE : ENV.Desktop
}
