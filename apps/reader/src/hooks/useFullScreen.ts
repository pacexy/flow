import { useBoolean } from '@literal-ui/hooks'

export function useFullScreen() {
  const [active, toggle] = useBoolean(false)

  return {
    active,
    toggle: () => {
      active ? document.exitFullscreen() : document.body.requestFullscreen()
      toggle()
    },
  }
}
