import { useMediaQuery } from '@literal-ui/hooks'

export function useMobile() {
  return useMediaQuery('(max-width: 640px)')
}
