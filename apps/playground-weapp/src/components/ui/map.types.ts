export interface VaroMapPoint {
  latitude: number
  longitude: number
}

export interface VaroMapCallout {
  bgColor?: string
  borderColor?: string
  borderRadius?: number
  color?: string
  content: string
  display?: 'ALWAYS' | 'BYCLICK'
  fontSize?: number
  padding?: number
}

export interface VaroMapMarker extends VaroMapPoint {
  callout?: VaroMapCallout
  height?: number
  iconPath: string
  id: number
  rotate?: number
  title?: string
  width?: number
  zIndex?: number
}

export interface VaroMapPolyline {
  arrowLine?: boolean
  borderColor?: string
  borderWidth?: number
  color: string
  dottedLine?: boolean
  points: VaroMapPoint[]
  width: number
}

export interface VaroMapCircle extends VaroMapPoint {
  color?: string
  fillColor?: string
  radius: number
  strokeWidth?: number
}
