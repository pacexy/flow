export interface NavItem {
  id: string
  href: string
  label: string
  subitems?: Array<NavItem>
  parent?: string
}

export interface LandmarkItem {
  href?: string
  label?: string
  type?: string
}

export default class Navigation {
  constructor(xml: XMLDocument)

  toc: Array<NavItem>
  tocByHref: Record<string, number>
  tocById: Record<string, number>
  landmarks: Array<LandmarkItem>

  parse(xml: XMLDocument): void

  get(target: string): NavItem

  landmark(type: string): LandmarkItem

  load(json: string): Array<NavItem>

  forEach(fn: (item: NavItem) => {}): any

  private unpack(toc: Array<NavItem>): void

  private parseNav(navHtml: XMLDocument): Array<NavItem>

  private navItem(item: Element): NavItem

  private parseLandmarks(navHtml: XMLDocument): Array<LandmarkItem>

  private landmarkItem(item: Element): LandmarkItem

  private parseNcx(navHtml: XMLDocument): Array<NavItem>

  private ncxItem(item: Element): NavItem

  getByIndex(target: string, index: number, navItems: NavItem[]): NavItem
}
