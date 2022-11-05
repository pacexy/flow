import { IS_SERVER } from '@literal-ui/hooks'

// https://www.geeksforgeeks.org/how-to-detect-touch-screen-device-using-javascript
export const isTouchScreen = IS_SERVER ? false : 'ontouchstart' in window
export const scale = (value: number, valueInTouchScreen: number) =>
  isTouchScreen ? valueInTouchScreen : value
