import { debounce } from '@github/mini-throttle/decorators'
import type { Rendition, Location, Book } from 'epubjs'
import ePub from 'epubjs'
import Navigation, { NavItem } from 'epubjs/types/navigation'
import Section from 'epubjs/types/section'
import { ReadonlyDeep } from 'type-fest'
import { proxy, ref, snapshot } from 'valtio'

import { BookRecord, db } from '../db'
import { updateCustomStyle } from '../styles'

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
  description?: string
  cfi?: string
  subitems?: Match[]
}

export interface ISection extends Section {
  length: number
  images: string[]
  navitem?: INavItem
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
  epub?: Book
  rendition?: Rendition & { manager?: any }
  nav?: Navigation
  location?: Location
  prevLocation?: Location
  sections?: ISection[]
  results?: Match[]
  activeResultID?: string
  hasFlashed = true

  definitions = this.book.definitions
  onAddDefinition?: (def: string) => void
  addDefinition(def: string) {
    if (this.definitions.includes(def)) return
    this.onAddDefinition?.(def)
    this.definitions.push(def)
    db?.books.update(this.book.id, { definitions: snapshot(this.definitions) })
  }
  onRemoveDefinition?: (def: string) => void
  removeDefinition(def: string) {
    this.onRemoveDefinition?.(def)
    this.definitions = this.definitions.filter((d) => d !== def)
    db?.books.update(this.book.id, { definitions: snapshot(this.definitions) })
  }
  toggleDefinition(def: string) {
    def = def.trim()
    if (this.definitions.includes(def)) {
      this.removeDefinition(def)
    } else {
      this.addDefinition(def)
    }
  }

  keyword = ''
  setKeyword(keyword: string) {
    if (this.keyword === keyword) return
    this.keyword = keyword
    this.onKeywordChange()
  }

  // only use throttle/debounce for side effects
  @debounce(1000)
  async onKeywordChange() {
    this.results = await this.search()
  }

  get totalLength() {
    return this.sections?.reduce((acc, s) => acc + s.length, 0) ?? 0
  }

  get percentage() {
    if (!this.sections || !this.location) return 0
    const start = this.location.start
    const i = this.sections.findIndex((s) => s.href === start.href)
    const previousSectionsLength = this.sections
      .slice(0, i)
      .reduce((acc, s) => acc + s.length, 0)
    const previousSectionsPercentage = previousSectionsLength / this.totalLength
    const currentSectionPercentage = this.sections[i]!.length / this.totalLength
    const displayedPercentage = start.displayed.page / start.displayed.total

    const percentage =
      previousSectionsPercentage +
      currentSectionPercentage * displayedPercentage

    // effect
    db?.books.update(this.book.id, { cfi: start.cfi, percentage })

    return percentage
  }

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

  mapSectionToNavItem(href: string) {
    let navItem: NavItem | undefined
    this.nav?.toc.forEach((item) =>
      dfs(item as NavItem, (i) => {
        if (i.href.startsWith(href)) navItem ??= i
      }),
    )
    return navItem
  }

  get currentSection() {
    return this.sections?.find((s) => s.href === this.location?.start.href)
  }

  get currentNavItem() {
    return this.location
      ? this.mapSectionToNavItem(this.location.start.href)
      : undefined
  }

  get view() {
    return this.rendition?.manager?.views._views[0]
  }

  getNavPath(navItem = this.currentNavItem) {
    const path = []

    if (this.nav) {
      while (navItem) {
        path.unshift(navItem)
        const parentId = navItem.parent
        if (!parentId) {
          navItem = undefined
        } else {
          // @ts-ignore
          const index = this.nav.tocById[parentId]
          // @ts-ignore
          navItem = this.nav.getByIndex(parentId, index, this.nav.toc)
        }
      }
    }

    return path
  }

  searchInSection(keyword = this.keyword, section = this.currentSection) {
    if (!section) return

    const subitems = section.find(keyword) as unknown as Match[]
    if (!subitems.length) return

    const navItem = section.navitem
    if (navItem) {
      const path = this.getNavPath(navItem)
      path.pop()
      return {
        id: navItem.href,
        excerpt: navItem.label,
        description: path.map((i) => i.label).join(' / '),
        subitems: subitems.map((i) => ({ ...i, id: i.cfi! })),
        expanded: true,
      }
    }
  }

  search(keyword = this.keyword) {
    // avoid blocking input
    return new Promise<Match[] | undefined>((resolve) => {
      requestIdleCallback(() => {
        if (!keyword) {
          resolve(undefined)
          return
        }

        const results: Match[] = []

        this.sections?.forEach((s) => {
          const result = this.searchInSection(keyword, s)
          if (result) results.push(result)
        })

        resolve(results)
      })
    })
  }

  async render(el: HTMLDivElement) {
    if (this.rendition) return

    const file = await db?.files.get(this.book.name)
    if (!file) return

    const data = await file.file.arrayBuffer()
    this.epub = ref(ePub(data))

    this.epub.loaded.navigation.then((nav) => {
      this.nav = nav
    })
    console.log(
      '🚀 ~ file: Reader.ts ~ line 69 ~ ReaderTab ~ this.epub.loaded.navigation.then ~ this.epub',
      this.epub,
    )
    this.epub.loaded.spine.then((spine: any) => {
      const sections = spine.spineItems as ISection[]
      // https://github.com/futurepress/epub.js/issues/887#issuecomment-700736486
      const promises = sections.map((s) =>
        s.load(this.epub?.load.bind(this.epub)),
      )

      Promise.all(promises).then(() => {
        sections.forEach((s) => {
          s.length = s.document.body.textContent?.length ?? 0
          s.images = [...s.document.querySelectorAll('img')].map((el) => el.src)
          this.epub!.loaded.navigation.then(() => {
            s.navitem = this.mapSectionToNavItem(s.href)
          })
        })
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
    this.rendition.display(this.location?.start.cfi ?? this.book.cfi)
    this.rendition.themes.default({
      a: {
        color: '#3b82f6 !important',
        'text-decoration': 'none !important',
      },
    })
    this.rendition.hooks.render.register(async (view: any) => {
      const str = localStorage.getItem('settings')
      const settings = str && JSON.parse(str)
      await updateCustomStyle(view.contents, settings)

      // run after `counter`
      // https://github.com/futurepress/epub.js/blob/0963efe979e34d53507fee1dc10827ecb07fdc75/src/managers/default/index.js#L413
      view.on('resized', () => {
        this.hasFlashed = true
      })
    })

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

  constructor(public readonly book: BookRecord) {
    this.book = ref(book)
  }
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
    const group = proxy(new ReaderGroup(tabs))
    this.groups.splice(index, 0, group)
    this.focusedIndex = index
    return group
  }

  selectGroup(index: number) {
    this.focusedIndex = index
  }
}
