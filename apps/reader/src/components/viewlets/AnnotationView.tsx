import { useSnapshot } from 'valtio'

import { reader } from '../Reader'
import { Row } from '../Row'

import { Pane } from './Pane'
import { View, ViewProps } from './View'

export const AnnotationView: React.FC<ViewProps> = (props) => {
  const { focusedTab } = useSnapshot(reader)

  return (
    <View {...props}>
      <Pane headline="Definitions">
        {focusedTab?.definitions.map((d) => {
          return (
            <Row
              key={d}
              onDelete={() => {
                reader.focusedTab?.removeDefinition(d)
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
