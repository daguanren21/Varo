export type VariantRecord = Record<string, string | boolean | undefined>

export function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function createVariantClass(base: string, variants: VariantRecord) {
  const suffix = Object.entries(variants)
    .filter(([, value]) => value !== false && value != null)
    .map(([key, value]) => `${key}-${String(value)}`)
    .join(' ')

  return joinClasses(base, suffix)
}
