export function keys<T extends object>(o: T) {
  return Object.keys(o) as (keyof T)[]
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
