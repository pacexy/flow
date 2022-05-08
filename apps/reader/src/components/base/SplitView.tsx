export type Orientation = 'horizontal' | 'vertical'

export interface ISplitView<T> {
  children: T[]
  orientation?: Orientation
}

interface SplitViewProps {
  orientation?: Orientation
}

export const SplitView: React.FC<SplitViewProps> = ({
  children,
  orientation = 'horizontal',
}) => {
  orientation
  return <div className="flex h-full">{children}</div>
}
