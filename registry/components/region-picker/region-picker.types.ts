export type RegionValue = string | number

export interface VaroRegionOption {
  children?: VaroRegionOption[]
  disabled?: boolean
  label: string
  latitude?: number
  longitude?: number
  value: RegionValue
}

export interface VaroRegionShortcut {
  label: string
  path: RegionValue[]
}

export interface VaroRegionSelection {
  labels: string[]
  latitude?: number
  longitude?: number
  option?: VaroRegionOption
  path: RegionValue[]
}
