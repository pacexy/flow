import { useSnapshot } from 'valtio'

import { reader } from '../Reader'
import { Row } from '../Row'
import { PaneViewProps, PaneView, Pane } from '../base'

export const AnnotationView: React.FC<PaneViewProps> = (props) => {
  const { focusedBookTab } = useSnapshot(reader)

  return (
    <PaneView {...props}>
      <Pane headline="Definitions">
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
    </PaneView>
  )
}
