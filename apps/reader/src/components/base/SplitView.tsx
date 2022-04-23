export const enum Orientation {
  VERTICAL,
  HORIZONTAL,
}

interface SplitViewProps {
  orientation?: Orientation
}

export const SplitView: React.FC<SplitViewProps> = ({ children }) => {
  return <div className={'scroll-parent h-full'}>{children}</div>
}
