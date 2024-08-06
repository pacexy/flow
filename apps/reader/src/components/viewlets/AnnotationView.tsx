import { useBoolean } from '@literal-ui/hooks'
import React, { Fragment } from 'react'
import { useMemo } from 'react'
import { VscCopy } from 'react-icons/vsc'

import { Annotation } from '@flow/reader/annotation'
import { useTranslation } from '@flow/reader/hooks'
import { reader, useReaderSnapshot } from '@flow/reader/models'
import { group, keys } from '@flow/reader/utils'

import { Row } from '../Row'
import { PaneViewProps, PaneView, Pane } from '../base'

export const AnnotationView: React.FC<PaneViewProps> = (props) => {
  return (
    <PaneView {...props}>
      <DefinitionPane />
      <AnnotationPane />
    </PaneView>
  )
}

const DefinitionPane: React.FC = () => {
  const { focusedBookTab } = useReaderSnapshot()
  const t = useTranslation('annotation')

  return (
    <Pane headline={t('definitions')} preferredSize={120}>
      {focusedBookTab?.book.definitions.map((d) => {
        return (
          <Row
            key={d}
            onDelete={() => {
              reader.focusedBookTab?.undefine(d)
            }}
          >
            {d}
          </Row>
        )
      })}
    </Pane>
  )
}

const AnnotationPane: React.FC = () => {
  const { focusedBookTab } = useReaderSnapshot()
  const t = useTranslation('annotation')
  const groupedAnnotation = useMemo(() => {
    return group(
      (focusedBookTab?.book.annotations as Annotation[]) ?? [],
      (a) => a.spine.index,
    )
  }, [focusedBookTab?.book.annotations])

  const exportAnnotations = () => {
    const annotations = (focusedBookTab?.book.annotations ?? []).map((a) => ({
      ...a,
    }))
    // process annotations to be under each section
    // group annotations by title
    const grouped = group(annotations, (a) => a.spine.title)
    const exported: Record<string, any[]> = {}
    for (const chapter in grouped) {
      const annotations =
        grouped[chapter]?.map((a) => {
          const annotation: Record<string, any> = {}
          if (a.notes !== undefined) annotation.notes = a.notes
          if (a.text !== undefined) annotation.text = a.text
          return annotation
        }) ?? []
      exported[chapter] = annotations
    }

    // Copy to clipboard as markdown
    const exportedAnnotationsMd = Object.entries(exported)
      .map(([chapter, annotations]) => {
        return `## ${chapter}\n${annotations
          .map((a) => `- ${a.text} ${a.notes ? `(${a.notes})` : ''}`)
          .join('\n')}`
      })
      .join('\n\n')
    navigator.clipboard.writeText(exportedAnnotationsMd)
  }

  return (
    <Pane
      headline={t('annotations')}
      actions={
        Object.keys(groupedAnnotation).length > 0
          ? [
              {
                id: 'copy-all',
                title: t('export'),
                Icon: VscCopy,
                handle() {
                  exportAnnotations()
                },
              },
            ]
          : []
      }
    >
      {keys(groupedAnnotation).map((k) => (
        <AnnotationBlock key={k} annotations={groupedAnnotation[k]!} />
      ))}
    </Pane>
  )
}

interface AnnotationBlockProps {
  annotations: Annotation[]
}
const AnnotationBlock: React.FC<AnnotationBlockProps> = ({ annotations }) => {
  const [expanded, toggle] = useBoolean(true)

  return (
    <div>
      <Row
        depth={1}
        badge
        expanded={expanded}
        toggle={toggle}
        subitems={annotations}
      >
        {annotations[0]?.spine.title}
      </Row>

      {expanded && (
        <div>
          {annotations.map((a) => (
            <Fragment key={a.id}>
              <Row
                depth={2}
                onClick={() => {
                  reader.focusedBookTab?.display(a.cfi)
                }}
                onDelete={() => {
                  reader.focusedBookTab?.removeAnnotation(a.cfi)
                }}
              >
                {a.text}
              </Row>
              {a.notes && (
                <Row
                  depth={3}
                  onClick={() => {
                    reader.focusedBookTab?.display(a.cfi)
                  }}
                >
                  <span className="text-outline">{a.notes}</span>
                </Row>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
