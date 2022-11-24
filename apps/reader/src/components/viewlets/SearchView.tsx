import { useState, useEffect } from 'react'
import Highlighter from 'react-highlight-words'
import { VscCollapseAll, VscExpandAll } from 'react-icons/vsc'
import { useRecoilValue } from 'recoil'

import { useList } from '@flow/reader/hooks'
import {
  flatTree,
  IMatch,
  useReaderSnapshot,
  reader,
} from '@flow/reader/models'
import { actionState } from '@flow/reader/state'

import { TextField } from '../Form'
import { Row } from '../Row'
import { PaneViewProps, PaneView } from '../base'

// When inputting with IME and storing state in `valtio`,
// unexpected rendering with `e.target.value === ''` occurs,
// which leads to `<input>` and IME flash to empty,
// while this will not happen when using `React.useState`,
// so we should create an intermediate `keyword` state to fix this.
function useIntermediateKeyword() {
  const [keyword, setKeyword] = useState('')
  const { focusedBookTab } = useReaderSnapshot()

  useEffect(() => {
    setKeyword(focusedBookTab?.keyword ?? '')
  }, [focusedBookTab?.keyword])

  useEffect(() => {
    reader.focusedBookTab?.setKeyword(keyword)
  }, [keyword])

  return [keyword, setKeyword] as const
}

export const SearchView: React.FC<PaneViewProps> = (props) => {
  const action = useRecoilValue(actionState)
  const { focusedBookTab } = useReaderSnapshot()

  const [keyword, setKeyword] = useIntermediateKeyword()

  const results = focusedBookTab?.results
  const expanded = results?.some((r) => r.expanded)

  return (
    <PaneView
      actions={[
        {
          id: expanded ? 'collapse-all' : 'expand-all',
          title: expanded ? 'Collapse All' : 'Expand All',
          Icon: expanded ? VscCollapseAll : VscExpandAll,
          handle() {
            reader.focusedBookTab?.results?.forEach(
              (r) => (r.expanded = !expanded),
            )
          },
        },
      ]}
      {...props}
    >
      <div className="scroll-parent">
        <div className="px-5 py-px">
          <TextField
            as="input"
            name="keyword"
            autoFocus={action === 'Search'}
            hideLabel
            value={keyword}
            placeholder="Search"
            onChange={(e) => setKeyword(e.target.value)}
            onClear={() => setKeyword('')}
          />
        </div>
        {keyword && results && (
          <ResultList results={results as IMatch[]} keyword={keyword} />
        )}
      </div>
    </PaneView>
  )
}

interface ResultListProps {
  results: IMatch[]
  keyword: string
}
const ResultList: React.FC<ResultListProps> = ({ results, keyword }) => {
  const rows = results.flatMap((r) => flatTree(r)) ?? []
  const { outerRef, innerRef, items } = useList(rows)

  const sectionCount = results.length
  const resultCount = results.reduce((a, r) => r.subitems!.length + a, 0)

  return (
    <>
      <div className="typescale-body-small text-outline px-5  py-2">
        {resultCount} results in {sectionCount} sections
      </div>
      <div ref={outerRef} className="scroll">
        <div ref={innerRef}>
          {items.map(({ index }) => (
            <ResultRow key={index} result={rows[index]} keyword={keyword} />
          ))}
        </div>
      </div>
    </>
  )
}

interface ResultRowProps {
  result?: IMatch
  keyword: string
}
const ResultRow: React.FC<ResultRowProps> = ({ result, keyword }) => {
  if (!result) return null
  const { cfi, depth, expanded, subitems, id } = result
  let { excerpt, description } = result
  const tab = reader.focusedBookTab
  const isResult = depth === 1

  excerpt = excerpt.trim()
  description = description?.trim()

  return (
    <Row
      title={description ? `${description} / ${excerpt}` : excerpt}
      label={excerpt}
      description={description}
      depth={depth}
      active={tab?.activeResultID === id}
      expanded={expanded}
      subitems={subitems}
      badge={isResult}
      {...(!isResult && {
        onClick: () => {
          if (tab) {
            tab.activeResultID = id
            tab.display(cfi)
          }
        },
      })}
      toggle={() => tab?.toggleResult(id)}
    >
      {!isResult && (
        <Highlighter
          highlightClassName="match-highlight"
          searchWords={[keyword]}
          textToHighlight={excerpt}
        />
      )}
    </Row>
  )
}
