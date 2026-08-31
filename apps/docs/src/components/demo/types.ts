export type DemoKind
  = | 'button'
    | 'badge'
    | 'cell'
    | 'divider'
    | 'elevator'
    | 'fixed-nav'
    | 'grid'
    | 'image'
    | 'indicator'
    | 'input'
    | 'layout'
    | 'menu'
    | 'navbar'
    | 'overlay'
    | 'pagination'
    | 'popup'
    | 'popover'
    | 'side-navbar'
    | 'space'
    | 'sticky'
    | 'tabbar'
    | 'tabs'
    | 'dialog'
    | 'overview'

export type Locale = 'zh' | 'en'
export type Platform = 'h5' | 'weapp'

export interface PlatformContent {
  runtime: string
  packageName: string
  appTitle: string
  appSubtitle: string
  statusRight: string
  code: string
  primaryText?: string
  secondaryText?: string
  disabledText?: string
  controlledLabel?: string
  uncontrolledLabel?: string
  placeholder?: string
  defaultValue?: string
  cellGroupTitle?: string
  cellGroupDesc?: string
  cellTitle?: string
  cellSubTitle?: string
  cellDesc?: string
  cellLinkTitle?: string
  cellLinkDesc?: string
  dialogHint?: string
  dialogOpenText?: string
  dialogCloseText?: string
  dialogTitle?: string
  dialogBody?: string
  popupTitle?: string
  popupBody?: string
  popupOpenText?: string
  popupCloseText?: string
  overlayOpenText?: string
  overlayText?: string
}

export interface DemoContent {
  title: string
  description: string
  platforms: Record<Platform, PlatformContent>
}
