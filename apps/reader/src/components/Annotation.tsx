import { useEffect } from 'react'
import { useSnapshot } from 'valtio'

import { colorMap, Annotation as IAnnotation } from '../annotation'
import { useSetAction } from '../hooks'
import { BookTab, compareHref } from '../models'

// avoid click penetration
let clickedAnnotation = false

export const getClickedAnnotation = () => clickedAnnotation
export const setClickedAnnotation = (v: boolean) => (clickedAnnotation = v)

interface FindMatchProps {
  tab: BookTab
}
const FindMatches: React.FC<FindMatchProps> = ({ tab }) => {
  const setAction = useSetAction()
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
            // tailwind yellow-500
            fill: 'rgba(234, 179, 8, 0.3)',
            'fill-opacity': 'unset',
          },
        )

        const g = h?.mark.element as SVGGElement
        g?.addEventListener('click', () => {
          setClickedAnnotation(true)
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
const Definition: React.FC<DefinitionProps> = ({ tab, definition }) => {
  const setAction = useSetAction()
  const { rendition, currentHref } = useSnapshot(tab)

  useEffect(() => {
    const result = tab.searchInSection(definition)
    const matches = result?.subitems

    matches?.forEach((m) => {
      try {
        const h = rendition?.annotations.highlight(
          m.cfi!,
          undefined,
          undefined,
          undefined,
          {
            // tailwind gray-600
            fill: 'rgba(75, 85, 99, 0.15)',
            'fill-opacity': 'unset',
          },
        )

        const g = h?.mark.element as SVGGElement

        // `<rect>` should be reserved to response `click`
        g?.addEventListener('click', () => {
          tab.setAnnotationRange(m.cfi!)
          setClickedAnnotation(true)
        })
      } catch (error) {
        // ignore matched text in `<title>`
      }
    })

    return () => {
      matches?.forEach((m) =>
        rendition?.annotations.remove(m.cfi!, 'highlight'),
      )
    }
  }, [currentHref, definition, rendition?.annotations, setAction, tab])

  return null
}

interface AnnotationProps {
  tab: BookTab
  annotation: IAnnotation
}
const Annotation: React.FC<AnnotationProps> = ({ tab, annotation }) => {
  const { rendition } = useSnapshot(tab)

  useEffect(() => {
    const h = rendition?.annotations[annotation.type](
      annotation.cfi,
      undefined,
      undefined,
      undefined,
      {
        fill: colorMap[annotation.color],
        'fill-opacity': '0.5',
      },
    )

    const g = h?.mark?.element as SVGGElement

    // `<rect>` should be reserved to response `click`
    g?.addEventListener('click', () => {
      tab.setAnnotationRange(annotation.cfi)
      setClickedAnnotation(true)
    })

    return () => {
      rendition?.annotations.remove(annotation.cfi, annotation.type)
    }
  }, [
    annotation.cfi,
    annotation.color,
    annotation.type,
    rendition?.annotations,
    tab,
  ])

  return null
}

interface AnnotationsProps {
  tab: BookTab
}
export const Annotations: React.FC<AnnotationsProps> = ({ tab }) => {
  const { book, section } = useSnapshot(tab)

  return (
    <>
      <FindMatches tab={tab} />
      {/* with `key`, react will mount/unmount it automatically */}
      {book.annotations
        // seems to fix annotation flash when executing `next()` and `display()`
        .filter((a) => a.spine.index === section?.index)
        .map((annotation) => (
          <Annotation key={annotation.id} tab={tab} annotation={annotation} />
        ))}
      {book.definitions.map((definition) => (
        <Definition key={definition} tab={tab} definition={definition} />
      ))}
    </>
  )
}
