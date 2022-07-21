import { useSnapshot } from 'valtio'

import { reader } from '../Reader'
import { Row } from '../Row'

import { Pane } from './Pane'
import { View, ViewProps } from './View'

export const AnnotationView: React.FC<ViewProps> = (props) => {
  const { focusedBookTab } = useSnapshot(reader)

  return (
    <View {...props}>
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
    </View>
  )
}
