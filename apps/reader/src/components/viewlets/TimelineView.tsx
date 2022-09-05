import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useSnapshot } from 'valtio'

import { useList } from '@ink/reader/hooks'

import { reader } from '../Reader'
import { Row } from '../Row'
import { PaneViewProps, PaneView, Pane } from '../base'

dayjs.extend(relativeTime)
export const TimelineView: React.FC<PaneViewProps> = (props) => {
  const { focusedBookTab } = useSnapshot(reader)
  const rows = focusedBookTab?.timeline
  const { outerRef, innerRef, items } = useList(rows)

  return (
    <PaneView {...props}>
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
                  title={focusedBookTab.mapSectionToNavItem(href)?.label}
                  onClick={() => {
                    reader.focusedBookTab?.display(cfi)
                  }}
                />
              )
            })}
          </div>
        )}
      </Pane>
    </PaneView>
  )
}
