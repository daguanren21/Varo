// Generated from registry/components/pagination/pagination-utils.ts; edit the Registry source.
export type PaginationToken = number | 'start-ellipsis' | 'end-ellipsis'

export function isAvailablePage(page: number, pageCount: number): boolean {
  return Number.isSafeInteger(pageCount) && Number.isSafeInteger(page) && page >= 1 && page <= pageCount
}

export function getPaginationTokens(pageCount: number, current: number): PaginationToken[] {
  if (!isAvailablePage(1, pageCount)) { return [] }
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const page = Number.isSafeInteger(current) ? Math.min(pageCount, Math.max(1, current)) : 1
  if (page <= 3) { return [1, 2, 3, 'end-ellipsis', pageCount] }
  if (page >= pageCount - 2) { return [1, 'start-ellipsis', pageCount - 2, pageCount - 1, pageCount] }
  return [1, 'start-ellipsis', page, 'end-ellipsis', pageCount]
}
