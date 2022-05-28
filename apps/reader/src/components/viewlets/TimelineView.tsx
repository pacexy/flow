import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useSnapshot } from 'valtio'

import { useList } from '@ink/reader/hooks'

import { reader } from '../Reader'
import { Row } from '../Row'

import { Pane } from './Pane'
import { View, ViewProps } from './View'

dayjs.extend(relativeTime)
export const TimelineView: React.FC<ViewProps> = (props) => {
  const { focusedTab } = useSnapshot(reader)
  const rows = focusedTab?.timeline
  const { outerRef, innerRef, items } = useList(rows)

  return (
    <View {...props}>
      <Pane headline="Timeline" ref={outerRef}>
        {rows && (
          <div ref={innerRef}>
            {items.map(({ index }) => {
              const row = rows[index]
              if (!row) return null

              const { location, timestamp } = row
              const { cfi, href, displayed } = location.start
              return (
                <Row
                  key={timestamp}
                  description={displayed.page}
                  info={dayjs(timestamp).format('HH:mm')}
                  title={focusedTab.mapSectionToNavItem(href)?.label}
                  onClick={() => {
                    reader.focusedTab?.display(cfi)
                  }}
                />
              )
            })}
          </div>
        )}
      </Pane>
    </View>
  )
}
