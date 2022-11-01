import { IS_SERVER } from '@literal-ui/hooks'

// https://www.geeksforgeeks.org/how-to-detect-touch-screen-device-using-javascript
export const isTouchScreen = IS_SERVER ? false : 'ontouchstart' in window
