export type SizeValue = number | string
export type PairSizeValue = SizeValue | [SizeValue, SizeValue]

export function normalizeSize(value: SizeValue | undefined) {
  if (value == null || value === '') {
    return undefined
  }

  return typeof value === 'number' ? `${value}px` : value
}

export function normalizePairSize(value: PairSizeValue | undefined) {
  if (Array.isArray(value)) {
    return [normalizeSize(value[0]), normalizeSize(value[1])] as const
  }

  const normalized = normalizeSize(value)
  return [normalized, normalized] as const
}
