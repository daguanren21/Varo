export function isPathIndex(segment: string): boolean {
  return /^\d+$/.test(segment)
}

type PathContainer = Record<string | number, unknown>

export function getByPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((target, segment) => {
    if (target === null || target === undefined) return undefined
    return (target as Record<string, unknown>)[segment]
  }, source)
}

export function setByPath<TValue>(source: TValue, path: string, value: unknown): TValue {
  const segments = path.split('.')
  const next = (Array.isArray(source) ? [...source] : { ...(source as Record<string, unknown>) }) as PathContainer
  let cursor = next

  segments.forEach((segment, index) => {
    const key = isPathIndex(segment) ? Number(segment) : segment

    if (index === segments.length - 1) {
      cursor[key] = value
      return
    }

    const child = cursor[key]
    const nextSegment = segments[index + 1]!
    const nextChild =
      Array.isArray(child)
        ? [...child]
        : child && typeof child === 'object'
          ? { ...(child as Record<string, unknown>) }
          : isPathIndex(nextSegment)
            ? []
            : {}

    cursor[key] = nextChild
    cursor = nextChild as PathContainer
  })

  return next as TValue
}
