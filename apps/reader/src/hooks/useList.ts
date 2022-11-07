import useVirtual from 'react-cool-virtual'

import { scale } from '../platform'

export const LIST_ITEM_SIZE = scale(24, 32)
export function useList(array: Readonly<any[]> = []) {
  return useVirtual<HTMLDivElement>({
    itemCount: array.length,
    itemSize: LIST_ITEM_SIZE,
  })
}
