import { useMobile } from './useMobile'

export enum Env {
  Desktop = 1,
  Mobile = 1 << 1,
}

export function useEnv() {
  const mobile = useMobile()
  return mobile ? Env.Mobile : Env.Desktop
}
