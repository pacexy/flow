import { Pane } from './Pane'
import { View, ViewProps } from './View'

export const SearchView: React.FC<ViewProps> = (props) => {
  return (
    <View {...props}>
      <SearchPane />
    </View>
  )
}

const SearchPane: React.FC = ({}) => {
  return <Pane headline="Search"></Pane>
}
