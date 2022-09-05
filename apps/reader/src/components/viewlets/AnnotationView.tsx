import { useSnapshot } from 'valtio'


import { reader } from '../Reader'
import { Row } from '../Row'
import { PaneViewProps, PaneView, Pane } from '../base'

export const AnnotationView: React.FC<PaneViewProps> = (props) => {
  const { focusedBookTab } = useSnapshot(reader)

  return (
    <PaneView {...props}>
      <Pane headline="Definitions">
        {focusedBookTab?.definitions.map((d) => {
          return (
            <Row
              key={d}
              onDelete={() => {
                reader.focusedBookTab?.removeDefinition(d)
              }}
            >
              {d}
            </Row>
          )
        })}
      </Pane>
    </PaneView>
  )
}
