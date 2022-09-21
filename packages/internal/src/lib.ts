export const str = 'Hello world'

export function range(n: number) {
  return [...new Array(n)].map((_, i) => i)
}
