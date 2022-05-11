import { useEffect, useState } from 'react'
import Highlighter from 'react-highlight-words'
import { VscCollapseAll, VscExpandAll } from 'react-icons/vsc'
import { useSnapshot } from 'valtio'

import { useList } from '@ink/reader/hooks'
import { flatTree, Match } from '@ink/reader/models'

import { reader } from '../Reader'
import { Row } from '../Row'
import { TextField } from '../TextField'

import { View, ViewProps } from './View'

export const SearchView: React.FC<ViewProps> = (props) => {
  const { focusedTab } = useSnapshot(reader)
  const [keyword, setKeyword] = useState('')

  const results = focusedTab?.results
  const expanded = results?.some((r) => r.expanded)

  useEffect(() => {
    // avoid blocking input
    setTimeout(() => {
      reader.focusedTab?.search(keyword)
    })
  }, [keyword])

  return (
    <View
      actions={[
        {
          id: expanded ? 'collapse-all' : 'expand-all',
          title: expanded ? 'Collapse All' : 'Expand All',
          Icon: expanded ? VscCollapseAll : VscExpandAll,
          handle() {
            reader.focusedTab?.results?.forEach((r) => (r.expanded = !expanded))
          },
        },
      ]}
      {...props}
    >
      <TextField
        as="input"
        name="keyword"
        hideLabel
        onChange={(e) => {
          setKeyword(e.target.value)
        }}
      />
      {results && <ResultList results={results as Match[]} keyword={keyword} />}
    </View>
  )
}

interface ResultListProps {
  results: Match[]
  keyword: string
}
export const ResultList: React.FC<ResultListProps> = ({ results, keyword }) => {
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
  result?: Match
  keyword: string
}
const ResultRow: React.FC<ResultRowProps> = ({ result, keyword }) => {
  if (!result) return null
  const { cfi, excerpt, depth, expanded, subitems, id } = result
  const tab = reader.focusedTab

  return (
    <Row
      title={excerpt}
      depth={depth}
      active={tab?.activeResultID === id}
      expanded={expanded}
      subitems={subitems}
      badge
      onClick={() => {
        if (!tab) return
        tab.activeResultID = id
        tab.rendition?.display(cfi)
      }}
      toggle={() => tab?.toggleResult(id)}
    >
      {depth === 2 && (
        <Highlighter
          highlightClassName="match-highlight"
          searchWords={[keyword]}
          textToHighlight={excerpt}
        />
      )}
    </Row>
  )
}
