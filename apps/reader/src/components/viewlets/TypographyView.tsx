import { Pane } from './Pane'

export const TypographyView: React.FC = ({}) => {
  return (
    <>
      <TypographyPane />
    </>
  )
}

const TypographyPane: React.FC = ({}) => {
  return <Pane headline="Typography"></Pane>
}
