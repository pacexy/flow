import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { useSnapshot } from 'valtio'

import { colorMap, Annotation as IAnnotation } from '../annotation'
import { BookTab, compareHref } from '../models'
import { actionState } from '../state'

// avoid click penetration
let clickedAnnotation = false

export const getClickedAnnotation = () => clickedAnnotation
export const setClickedAnnotation = (v: boolean) => (clickedAnnotation = v)

interface FindMatchProps {
  tab: BookTab
}
export const FindMatches: React.FC<FindMatchProps> = ({ tab }) => {
  const setAction = useSetRecoilState(actionState)
  const { rendition, results, currentHref } = useSnapshot(tab)

  useEffect(() => {
    const result = results?.find((r) => compareHref(currentHref, r.id))

    const matches = result?.subitems
    matches?.forEach((m) => {
      try {
        const h = rendition?.annotations.highlight(
          m.cfi!,
          undefined,
          undefined,
          undefined,
          {
            fill: 'rgba(255, 223, 93, 0.3)',
            'fill-opacity': 'unset',
          },
        ) as any

        const g = h?.mark.element as SVGGElement
        g?.addEventListener('click', () => {
          setClickedAnnotation(true)
          setAction('Search')
        })
      } catch (error) {
        // ignore matched text in `<title>`
      }
    })

    return () => {
      matches?.forEach((m) => {
        rendition?.annotations.remove(m.cfi!, 'highlight')
      })
    }
  }, [currentHref, rendition?.annotations, results, setAction])

  return null
}

interface DefinitionProps {
  tab: BookTab
  definition: string
}
export const Definition: React.FC<DefinitionProps> = ({ tab, definition }) => {
  const setAction = useSetRecoilState(actionState)
  const { rendition, currentHref } = useSnapshot(tab)

  useEffect(() => {
    const result = tab.searchInSection(definition)
    const matches = result?.subitems

    matches?.forEach((m) => {
      try {
        const h = rendition?.annotations.underline(
          m.cfi!,
          undefined,
          undefined,
          undefined,
          {
            stroke: '',
            'stroke-opacity': 0.3,
          },
        ) as any

        const g = h?.mark.element as SVGGElement

        // `<rect>` should be reserved to response `click`
        g?.addEventListener('click', () => {
          setClickedAnnotation(true)
          setAction('Search')
          tab.setKeyword(definition)
        })
      } catch (error) {
        // ignore matched text in `<title>`
      }
    })

    return () => {
      matches?.forEach((m) =>
        rendition?.annotations.remove(m.cfi!, 'underline'),
      )
    }
  }, [currentHref, definition, rendition?.annotations, setAction, tab])

  return null
}

interface AnnotationProps {
  tab: BookTab
  annotation: IAnnotation
}
export const Annotation: React.FC<AnnotationProps> = ({ tab, annotation }) => {
  const { rendition } = useSnapshot(tab)

  useEffect(() => {
    rendition?.annotations.add(
      annotation.type,
      annotation.cfi,
      undefined,
      () => {},
      undefined,
      {
        fill: colorMap[annotation.color],
        'fill-opacity': '0.5',
      },
    )

    return () => {
      rendition?.annotations.remove(annotation.cfi, annotation.type)
    }
  }, [
    annotation.cfi,
    annotation.color,
    annotation.type,
    rendition?.annotations,
  ])

  return null
}
