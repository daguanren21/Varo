import { afterEach, describe, expect, it, vi } from 'vitest'
import { cacDays, filter } from '../src/utils/util'

describe('date utilities', () => {
  afterEach(() => vi.useRealTimers())

  it('calculates leap and common month lengths', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 0, 31, 12))
    expect(cacDays(2024, 2)).toBe(29)
    expect(cacDays(2025, 2)).toBe(28)
    expect(cacDays(2025, 4)).toBe(30)
  })

  it('preserves supported date filter formats', () => {
    const date = '2026-02-03 04:05:06'

    expect(filter.dateFilter(date)).toBe('2026-02-03 04:05:06')
    expect(filter.dateFilter(date, 'YYYY-MM-DD')).toBe('2026-02-03')
    expect(filter.dateFilter(date, 'YYYY-MM-DD HH:mm')).toBe('2026-02-03 04:05')
    expect(filter.dateFilter(date, 'YYYY-MM')).toBe('2026-02')
    expect(filter.dateFilter(null)).toBe('---')
  })
})
