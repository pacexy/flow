import type { Rendition, Location } from 'epubjs'
import ePub from 'epubjs'
import Navigation, { NavItem } from 'epubjs/types/navigation'
import Section from 'epubjs/types/section'
import { ReadonlyDeep } from 'type-fest'
import { proxy, ref } from 'valtio'

import { BookRecord } from '../db'

function updateIndex(array: any[], deletedItemIndex: number) {
  const last = array.length - 1
  return deletedItemIndex > last ? last : deletedItemIndex
}

interface Node {
  id: string
  depth?: number
  expanded?: boolean
  subitems?: Node[]
}
export interface INavItem extends NavItem, Node {
  subitems?: INavItem[]
}

export interface Match extends Node {
  excerpt: string
  cfi?: string
  subitems?: Match[]
}

export function flatTree<T extends ReadonlyDeep<Node>>(
  node: T,
  depth = 1,
): T[] {
  if (!node.subitems || !node.subitems.length || !node.expanded) {
    return [{ ...node, depth }]
  }
  const children = node.subitems.flatMap((i) => flatTree(i, depth + 1)) as T[]
  return [{ ...node, depth }, ...children]
}

function find<T extends Node>(nodes: T[] = [], id: string): T | undefined {
  const node = nodes.find((n) => n.id === id)
  if (node) return node
  for (const child of nodes) {
    const node = find(child.subitems, id)
    if (node) return node as T
  }
  return undefined
}

export function dfs<T extends Node>(node: T, fn: (node: T) => void) {
  fn(node)
  node.subitems?.forEach((child) => dfs(child as T, fn))
}

export class ReaderTab {
  epub = ref(ePub(this.book.data))
  rendition?: Rendition
  nav?: Navigation
  location?: Location
  prevLocation?: Location
  sections?: Section[]
  results?: Match[]
  activeResultID?: string

  toggle(id: string) {
    const item = find(this.nav?.toc, id) as INavItem
    if (item) item.expanded = !item.expanded
  }

  toggleResult(id: string) {
    const item = find(this.results, id)
    if (item) item.expanded = !item.expanded
  }

  showPrevLocation() {
    this.prevLocation = this.location
  }

  hidePrevLocation() {
    this.prevLocation = undefined
  }

  search(keyword: string) {
    if (!keyword) {
      this.results = undefined
      return
    }

    const results: Match[] = []
    this.sections?.forEach((s) => {
      const subitems = s.find(keyword) as unknown as Match[]
      if (!subitems.length) return

      const navItem = this.nav?.get(s.href)
      if (navItem) {
        results.push({
          id: navItem.href,
          excerpt: navItem.label.trim(),
          subitems: subitems.map((i) => ({ ...i, id: i.cfi! })),
          expanded: true,
        })
      }
    })
    this.results = results
  }

  render(el: HTMLDivElement) {
    if (this.rendition) return

    this.epub.loaded.navigation.then((nav) => {
      this.nav = nav
    })
    console.log(
      '🚀 ~ file: Reader.ts ~ line 69 ~ ReaderTab ~ this.epub.loaded.navigation.then ~ this.epub',
      this.epub,
    )
    this.epub.loaded.spine.then((spine: any) => {
      const sections = spine.spineItems as Section[]
      // https://github.com/futurepress/epub.js/issues/887#issuecomment-700736486
      const promises = sections.map((s) =>
        s.load(this.epub.load.bind(this.epub)),
      )

      Promise.all(promises).then(() => {
        this.sections = ref(sections)
      })
    })
    this.rendition = ref(
      this.epub.renderTo(el, {
        width: '100%',
        height: '100%',
        allowScriptedContent: true,
      }),
    )
    this.rendition.display(this.location?.start.cfi)
    this.rendition.on('relocated', (loc: Location) => {
      console.log('relocated', loc)
      this.location = ref(loc)
    })

    this.rendition.on('attached', (...args: any[]) => {
      console.log('attached', args)
    })
    this.rendition.on('started', (...args: any[]) => {
      console.log('started', args)
    })
    this.rendition.on('displayed', (...args: any[]) => {
      console.log('displayed', args)
    })
    this.rendition.on('rendered', (...args: any[]) => {
      console.log('rendered', args)
    })
    this.rendition.on('removed', (...args: any[]) => {
      console.log('removed', args)
    })
  }

  constructor(public readonly book: BookRecord) {}
}

export class ReaderGroup {
  id = crypto.randomUUID()

  constructor(
    public tabs: ReaderTab[],
    public selectedIndex = tabs.length - 1,
  ) {}

  get selectedTab() {
    return this.tabs[this.selectedIndex]
  }

  removeTab(index: number) {
    this.tabs.splice(index, 1)
    this.selectedIndex = updateIndex(this.tabs, index)
  }

  addTab(book: BookRecord) {
    const index = this.tabs.findIndex((t) => t.book.id === book.id)
    if (index > -1) {
      this.selectTab(index)
      return this.tabs[index]
    }

    const tab = new ReaderTab(book)
    this.tabs.splice(++this.selectedIndex, 0, tab)
    return tab
  }

  selectTab(index: number) {
    this.selectedIndex = index
  }
}

export class Reader {
  groups: ReaderGroup[] = []
  focusedIndex = -1

  get focusedGroup() {
    return this.groups[this.focusedIndex]
  }

  get focusedTab() {
    return this.focusedGroup?.selectedTab
  }

  addTab(book: BookRecord, groupIdx = this.focusedIndex) {
    const group = this.groups[groupIdx]
    if (group) return group.addTab(book)
    const tab = new ReaderTab(book)
    this.addGroup([tab])
    return tab
  }

  removeTab(index: number, groupIdx = this.focusedIndex) {
    const group = this.groups[groupIdx]
    if (group?.tabs.length === 1) {
      this.removeGroup(groupIdx)
      return
    }
    group?.removeTab(index)
  }

  removeGroup(index: number) {
    this.groups.splice(index, 1)
    this.focusedIndex = updateIndex(this.groups, index)
  }

  addGroup(tabs: ReaderTab[], index = this.focusedIndex + 1) {
    console.log(index)
    const group = proxy(new ReaderGroup(tabs))
    this.groups.splice(index, 0, group)
    this.focusedIndex = index
    return group
  }

  selectGroup(index: number) {
    console.log(index)
    this.focusedIndex = index
  }
}
