import useVirtual from 'react-cool-virtual'

export function useList(array: Readonly<any[]> = []) {
  return useVirtual<HTMLDivElement>({
    itemCount: array.length,
    itemSize: 24,
  })
}
