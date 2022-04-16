import { Pane } from './Pane'

export const SearchView: React.FC = ({}) => {
  return (
    <>
      <SearchPane />
    </>
  )
}

const SearchPane: React.FC = ({}) => {
  return <Pane headline="Search"></Pane>
}
