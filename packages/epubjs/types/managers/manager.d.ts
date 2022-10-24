import Contents from '../contents'
import Layout from '../layout'
import { EpubCFIPair } from '../mapping'
import Section from '../section'

import View, { ViewSettings } from './view'

export interface ViewLocation {
  index: number
  href: string
  pages: number[]
  totalPages: number
  mapping: EpubCFIPair
}

export interface ManagerOptions extends ViewSettings {
  infinite?: boolean
  overflow?: string
  [key: string]: any
}

export default class Manager {
  constructor(options: object)

  render(element: Element, size?: { width: number; height: number }): void

  resize(width: number, height: number): void

  onOrientationChange(e: Event): void

  private createView(section: Section): View

  display(section: Section, target: string | number): Promise<void>

  private afterDisplayed(view: View): void

  private afterResized(view: View): void

  private moveTo(offset: { top: number; left: number }): void

  private append(section: Section): Promise<void>

  private prepend(section: Section): Promise<void>

  next(): Promise<void>

  prev(): Promise<void>

  current(): View

  clear(): void

  currentLocation(): ViewLocation[]

  visible(): View[]

  private scrollBy(x: number, y: number, silent: boolean): void

  private scrollTo(x: number, y: number, silent: boolean): void

  private onScroll(): void

  bounds(): object

  applyLayout(layout: Layout): void

  updateLayout(): void

  setLayout(layout: Layout): void

  updateAxis(axis: string, forceUpdate: boolean): void

  updateFlow(flow: string): void

  getContents(): Contents[]

  direction(dir: string): void

  isRendered(): boolean

  destroy(): void

  // Event emitters
  emit(type: any, ...args: any[]): void

  off(type: any, listener: any): any

  on(type: any, listener: any): any

  once(type: any, listener: any, ...args: any[]): any
}
