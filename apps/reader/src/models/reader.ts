import { debounce } from '@github/mini-throttle/decorators'
import type { Rendition, Location, Book } from 'epubjs'
import ePub from 'epubjs'
import Navigation, { NavItem } from 'epubjs/types/navigation'
import Section from 'epubjs/types/section'
import React from 'react'
import { ReadonlyDeep } from 'type-fest'
import { v4 as uuidv4 } from 'uuid'
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

interface TimelineItem {
  location: Location
  timestamp: number
}

class BaseTab {
  constructor(public readonly id: string, public readonly title = id) {}

  get isBook(): boolean {
    return this instanceof BookTab
  }

  get isPage(): boolean {
    return this instanceof PageTab
  }
}

export class BookTab extends BaseTab {
  epub?: Book
  iframe?: Window
  rendition?: Rendition & { manager?: any }
  nav?: Navigation
  locationToReturn?: Location
  sections?: ISection[]
  results?: Match[]
  activeResultID?: string
  rendered = false

  get container() {
    return this?.rendition?.manager?.container as HTMLDivElement | undefined
  }

  timeline: TimelineItem[] = []
  get location() {
    return this.timeline[0]?.location
  }

  display(target?: string, returnable = true) {
    this.rendition?.display(target)
    if (returnable) this.showPrevLocation()
  }
  displayFromSelector(selector: string, section: ISection, returnable = true) {
    const el = section.document.querySelector(selector)
    if (el) this.display(section.cfiFromElement(el), returnable)
  }
  prev() {
    this.rendition?.prev()
    // avoid content flash
    if (this.container?.scrollLeft === 0 && !this.location?.atStart) {
      this.rendered = false
    }
  }
  next() {
    this.rendition?.next()
  }

  updateBook(changes: Partial<ReadonlyDeep<BookRecord>>) {
    db?.books.update(this.book.id, changes)
  }

  definitions = this.book.definitions
  onAddDefinition?: (def: string) => void
  addDefinition(def: string) {
    if (this.definitions.includes(def)) return
    this.onAddDefinition?.(def)
    this.definitions.push(def)
    this.updateBook({ definitions: snapshot(this.definitions) })
  }
  onRemoveDefinition?: (def: string) => void
  removeDefinition(def: string) {
    this.onRemoveDefinition?.(def)
    this.definitions = this.definitions.filter((d) => d !== def)
    this.updateBook({ definitions: snapshot(this.definitions) })
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

  toggle(id: string) {
    const item = find(this.nav?.toc, id) as INavItem
    if (item) item.expanded = !item.expanded
  }

  toggleResult(id: string) {
    const item = find(this.results, id)
    if (item) item.expanded = !item.expanded
  }

  showPrevLocation() {
    this.locationToReturn = this.location
  }

  hidePrevLocation() {
    this.locationToReturn = undefined
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

  get currentHref() {
    return this.location?.start.href
  }

  get currentSection() {
    return this.sections?.find((s) => s.href === this.currentHref)
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
    const path: INavItem[] = []

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

    const file = await db?.files.get(this.book.id)
    if (!file) return

    const data = await file.file.arrayBuffer()
    this.epub = ref(ePub(data))

    this.epub.loaded.navigation.then((nav) => {
      this.nav = nav
    })
    console.log(this.epub)
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
    console.log(this.rendition)
    this.rendition.display(
      this.location?.start.cfi ?? this.book.cfi ?? undefined,
    )
    this.rendition.themes.default({
      html: {
        padding: '0 !important',
      },
      'a:any-link': {
        color: '#3b82f6 !important',
        'text-decoration': 'none !important',
      },
    })
    this.rendition.hooks.render.register((view: any) => {
      const str = localStorage.getItem('settings')
      const settings = str && JSON.parse(str)
      updateCustomStyle(view.contents, settings)
    })

    this.rendition.on('relocated', (loc: Location) => {
      console.log('relocated', loc)
      this.rendered = true
      this.timeline.unshift({
        location: loc,
        timestamp: Date.now(),
      })

      // calculate percentage
      if (this.sections) {
        const start = loc.start
        const i = this.sections.findIndex((s) => s.href === start.href)
        const previousSectionsLength = this.sections
          .slice(0, i)
          .reduce((acc, s) => acc + s.length, 0)
        const previousSectionsPercentage =
          previousSectionsLength / this.totalLength
        const currentSectionPercentage =
          this.sections[i]!.length / this.totalLength
        const displayedPercentage = start.displayed.page / start.displayed.total

        const percentage =
          previousSectionsPercentage +
          currentSectionPercentage * displayedPercentage

        this.book.percentage = percentage
        this.updateBook({ cfi: start.cfi, percentage })
      }
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
    this.rendition.on('rendered', (section: Section, view: any) => {
      console.log('rendered', [section, view])
      this.iframe = ref(view.window as Window)
    })
    this.rendition.on('removed', (...args: any[]) => {
      console.log('removed', args)
    })
  }

  constructor(public readonly book: BookRecord) {
    super(book.id, book.name)
    this.book = ref(book)
  }
}

class PageTab extends BaseTab {
  constructor(public readonly Component: React.FC<any>) {
    super(Component.displayName ?? 'Untitled')
  }
}

type Tab = BookTab | PageTab
type TabParam = ConstructorParameters<typeof BookTab | typeof PageTab>[0]

export class Group {
  id = uuidv4()
  tabs: Tab[] = []

  constructor(
    public tabParams: TabParam[] = [],
    public selectedIndex = tabParams.length - 1,
  ) {
    this.tabs = tabParams.map((param) => {
      const isPage = typeof param === 'function'
      return isPage ? new PageTab(param) : new BookTab(param)
    })
  }

  get selectedTab() {
    return this.tabs[this.selectedIndex]
  }

  get bookTabs() {
    return this.tabs.filter((t) => t instanceof BookTab) as BookTab[]
  }

  removeTab(index: number) {
    this.tabs.splice(index, 1)
    this.selectedIndex = updateIndex(this.tabs, index)
  }

  addTab(param: TabParam) {
    const isPage = typeof param === 'function'
    const id = isPage ? param.name : param.id

    const index = this.tabs.findIndex((t) => t.id === id)
    if (index > -1) {
      this.selectTab(index)
      return this.tabs[index]
    }

    const tab = isPage ? new PageTab(param) : new BookTab(param)
    this.tabs.splice(++this.selectedIndex, 0, tab)
    return tab
  }

  replaceTab(param: TabParam, index = this.selectedIndex) {
    this.addTab(param)
    this.removeTab(index)
  }

  selectTab(index: number) {
    this.selectedIndex = index
  }
}

export class Reader {
  groups: Group[] = []
  focusedIndex = -1

  get focusedGroup() {
    return this.groups[this.focusedIndex]
  }

  get focusedTab() {
    return this.focusedGroup?.selectedTab
  }

  get focusedBookTab() {
    return this.focusedTab instanceof BookTab ? this.focusedTab : undefined
  }

  addTab(param: TabParam, groupIdx = this.focusedIndex) {
    let group = this.groups[groupIdx]
    if (!group) {
      group = this.addGroup([])
    }
    return group.addTab(param)
  }

  removeTab(index: number, groupIdx = this.focusedIndex) {
    const group = this.groups[groupIdx]
    if (group?.tabs.length === 1) {
      this.removeGroup(groupIdx)
      return
    }
    group?.removeTab(index)
  }

  replaceTab(
    param: TabParam,
    index = this.focusedIndex,
    groupIdx = this.focusedIndex,
  ) {
    const group = this.groups[groupIdx]
    group?.replaceTab(param, index)
  }

  removeGroup(index: number) {
    this.groups.splice(index, 1)
    this.focusedIndex = updateIndex(this.groups, index)
  }

  addGroup(tabParams: TabParam[], index = this.focusedIndex + 1) {
    const group = proxy(new Group(tabParams))
    this.groups.splice(index, 0, group)
    this.focusedIndex = index
    return group
  }

  selectGroup(index: number) {
    this.focusedIndex = index
  }

  clear() {
    this.groups = []
    this.focusedIndex = -1
  }

  resize() {
    this.groups.forEach(({ bookTabs }) => {
      bookTabs.forEach(({ rendition }) => {
        // @ts-ignore
        rendition?.resize()
      })
    })
  }
}
