import type { RegionValue, VaroRegionOption, VaroRegionSelection } from './region-picker.types'

export function findRegionOption(options: VaroRegionOption[], value: RegionValue) {
  return options.find(option => option.value === value)
}

export function normalizeRegionPath(options: VaroRegionOption[], path: RegionValue[]) {
  const normalized: RegionValue[] = []
  let current = options
  for (const value of path) {
    const option = findRegionOption(current, value)
    if (!option) { break }
    normalized.push(option.value)
    current = option.children ?? []
  }
  return normalized
}

export function regionOptionsAtLevel(options: VaroRegionOption[], path: RegionValue[], level: number) {
  let current = options
  for (let index = 0; index < level; index += 1) {
    const option = findRegionOption(current, path[index])
    if (!option) { return [] }
    current = option.children ?? []
  }
  return current
}

export function resolveRegionSelection(options: VaroRegionOption[], path: RegionValue[]): VaroRegionSelection {
  const normalized = normalizeRegionPath(options, path)
  const labels: string[] = []
  let current = options
  let option: VaroRegionOption | undefined
  for (const value of normalized) {
    option = findRegionOption(current, value)
    if (!option) { break }
    labels.push(option.label)
    current = option.children ?? []
  }
  return {
    labels,
    latitude: option?.latitude,
    longitude: option?.longitude,
    option,
    path: normalized,
  }
}

export function isRegionLeaf(option: VaroRegionOption | undefined) {
  return Boolean(option && (!option.children || option.children.length === 0))
}
