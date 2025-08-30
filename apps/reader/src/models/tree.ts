export interface INode {
  id: string
  depth?: number
  expanded?: boolean
  subitems?: INode[]
}

export function flatTree<T extends INode>(
  node: T,
  depth = 1,
  expandedState: Record<string, boolean> = {},
): T[] {
  if (!node.subitems || !node.subitems.length || !expandedState[node.id]) {
    return [{ ...node, depth }]
  }
  const children = node.subitems.flatMap((i) =>
    flatTree(i as T, depth + 1, expandedState),
  )
  return [{ ...node, depth }, ...children]
}

export function find<T extends INode>(
  nodes: T[] = [],
  id: string,
): T | undefined {
  const node = nodes.find((n) => n.id === id)
  if (node) return node
  for (const child of nodes) {
    const node = find(child.subitems, id)
    if (node) return node as T
  }
  return undefined
}

export function dfs<T extends INode>(node: T, fn: (node: T) => void) {
  fn(node)
  node.subitems?.forEach((child) => dfs(child as T, fn))
}
