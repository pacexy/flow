import { Theme } from '@material/material-color-utilities'
import { atom, useRecoilValue, useSetRecoilState } from 'recoil'

const themeState = atom<Theme | undefined>({
  key: 'theme',
  default: undefined,
})

export function useTheme() {
  return useRecoilValue(themeState)
}

export function useSetTheme() {
  return useSetRecoilState(themeState)
}
