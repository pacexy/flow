import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { useList, useTranslation } from '@flow/reader/hooks'
import { reader, useReaderSnapshot } from '@flow/reader/models'

import { Row } from '../Row'
import { PaneViewProps, PaneView, Pane } from '../base'

dayjs.extend(relativeTime)
export const TimelineView: React.FC<PaneViewProps> = (props) => {
  const { focusedBookTab } = useReaderSnapshot()
  const rows = focusedBookTab?.timeline
  const { outerRef, innerRef, items } = useList(rows)
  const t = useTranslation('timeline')

  return (
    <PaneView {...props}>
      <Pane headline={t('title')} ref={outerRef}>
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
