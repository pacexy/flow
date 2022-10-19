export type AnnotationType = keyof typeof typeMap

export const typeMap = {
  highlight: {
    style: 'backgroundColor',
    class: 'rounded',
  },
  // underline: {
  //   style: 'border-bottom-color',
  //   class: 'border-b-2',
  // },
}

export type AnnotationColor = keyof typeof colorMap

// "dark color + low opacity" is clearer than "light color + high opacity"
// from tailwind [color]-600
export const colorMap = {
  yellow: 'rgba(217, 119, 6, 0.2)',
  red: 'rgba(220, 38, 38, 0.2)',
  green: 'rgba(22, 163, 74, 0.2)',
  blue: 'rgba(37, 99, 235, 0.2)',
}

export interface Annotation {
  id: string
  bookId: string
  cfi: string
  spine: {
    index: number
    title: string
  }
  createAt: number
  updatedAt: number
  type: AnnotationType
  color: AnnotationColor
  notes?: string
  text: string
}
