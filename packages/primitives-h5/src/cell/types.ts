export type CellSize = 'default' | 'large'
export type CellDescTextAlign = 'left' | 'right'

export interface CellRootProps {
  title?: string
  subTitle?: string
  desc?: string
  descTextAlign?: CellDescTextAlign
  icon?: string
  isLink?: boolean
  to?: string
  roundRadius?: string
  center?: boolean
  size?: CellSize
  clickable?: boolean
  titleWidth?: number | string
}

export interface CellGroupRootProps {
  title?: string
  desc?: string
}
