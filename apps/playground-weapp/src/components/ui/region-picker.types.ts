export type RegionValue = string | number

export interface VaroRegionOption {
  children?: VaroRegionOption[]
  disabled?: boolean
  hasChildren?: boolean
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

export interface VaroRegionLoadContext {
  level: number
  option?: VaroRegionOption
  path: RegionValue[]
}

export interface VaroRegionLoadSuccess extends VaroRegionLoadContext {
  options: VaroRegionOption[]
}

export interface VaroRegionLoadFailure extends VaroRegionLoadContext {
  error: unknown
}

export type VaroRegionLoader = (context: VaroRegionLoadContext) => Promise<VaroRegionOption[]>
