import type { Rendition } from 'epubjs'
import { proxy } from 'valtio'

function updateIndex(array: any[], deletedItemIndex: number) {
  const last = array.length - 1
  return deletedItemIndex > last ? last : deletedItemIndex
}

export class ReaderTab {
  rendition?: Rendition

  constructor(public readonly bookId: string) {}
}

export class ReaderGroup {
  selectedIndex = -1

  constructor(public tabs: ReaderTab[] = []) {}

  get selectedTab() {
    return this.tabs[this.selectedIndex]
  }

  removeTab(index: number) {
    this.tabs.splice(index, 1)
    this.selectedIndex = updateIndex(this.tabs, index)
  }

  addTab(bookId: string) {
    const index = this.tabs.findIndex((t) => t.bookId === bookId)
    if (index > -1) {
      this.selectTab(index)
      return this.tabs[index]
    }

    const tab = new ReaderTab(bookId)
    console.log(this.tabs)
    this.tabs.splice(++this.selectedIndex, 0, tab)
    console.log(this.tabs)
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

  addTab(bookId: string, groupIdx = this.focusedIndex) {
    const group = this.groups[groupIdx] ?? this.addGroup()
    return group.addTab(bookId)
  }

  removeTab(index: number, groupIdx = this.focusedIndex) {
    const group = this.groups[groupIdx]
    if (group.tabs.length === 1) {
      this.removeGroup(groupIdx)
      return
    }
    group.removeTab(index)
  }

  removeGroup(index: number) {
    this.groups.splice(index, 1)
    this.focusedIndex = updateIndex(this.groups, index)
  }

  addGroup(tabs?: ReaderTab[]) {
    const group = proxy(new ReaderGroup(tabs))
    this.groups.splice(++this.focusedIndex, 0, group)
    return group
  }

  selectGroup(index: number) {
    this.focusedIndex = index
  }
}
