import Contents from '../contents'
import Layout from '../layout'
import Section from '../section'

export interface ViewSettings {
  ignoreClass?: string
  axis?: string
  flow?: string
  layout?: Layout
  method?: string
  width?: number
  height?: number
  forceEvenPages?: boolean
  allowScriptedContent?: boolean
}

export default class View {
  constructor(section: Section, options: ViewSettings)

  create(): any

  render(request?: Function, show?: boolean): Promise<void>

  reset(): void

  size(_width: number, _height: number): void

  load(content: Contents): Promise<any>

  setLayout(layout: Layout): void

  setAxis(axis: string): void

  display(request?: Function): Promise<any>

  show(): void

  hide(): void

  offset(): { top: number; left: number }

  width(): number

  height(): number

  position(): object

  locationOf(target: string): { top: number; left: number }

  onDisplayed(view: View): void

  onResize(view: View): void

  bounds(force?: boolean): object

  highlight(
    cfiRange: string,
    data?: object,
    cb?: Function,
    className?: string,
    styles?: object,
  ): void

  underline(
    cfiRange: string,
    data?: object,
    cb?: Function,
    className?: string,
    styles?: object,
  ): void

  mark(cfiRange: string, data?: object, cb?: Function): void

  unhighlight(cfiRange: string): void

  ununderline(cfiRange: string): void

  unmark(cfiRange: string): void

  destroy(): void

  private onLoad(event: Event, promise: Promise<any>): void

  // Event emitters
  emit(type: any, ...args: any[]): void

  off(type: any, listener: any): any

  on(type: any, listener: any): any

  once(type: any, listener: any, ...args: any[]): any
}
