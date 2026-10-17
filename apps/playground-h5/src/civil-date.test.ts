// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'
import { isCalendarDate, scheduleDates, shiftCalendarDate } from './components/blocks/schedule-calendar-actions'
import { buildMonthDays, daysInMonth, normalizeMonth, parseDateFieldValue, shiftMonth, shiftYear } from './components/ui/date-utils'

afterEach(() => vi.unstubAllEnvs())

describe('installed civil-date helpers', () => {
  it.each([
    { zone: 'Pacific/Apia', year: 2011, day: 30 },
    { zone: 'Pacific/Kiritimati', year: 1994, day: 31 },
  ])('preserves Gregorian dates across the $zone date-line change', ({ zone, year, day }) => {
    vi.stubEnv('TZ', zone)
    const date = `${year}-12-${day}`
    expect(parseDateFieldValue(date)).toEqual([year, 12, day])
    expect(isCalendarDate(date)).toBe(true)
    expect(daysInMonth(year, 12)).toBe(31)
    expect(normalizeMonth(date)).toBe(`${year}-12`)
    expect(shiftMonth(date, 1)).toBe(`${year + 1}-01`)
    expect(shiftYear(date, 1)).toBe(`${year + 1}-12`)
    expect(buildMonthDays(`${year}-12`)).toEqual(Array.from({ length: 31 }, (_, index) => ({
      date: `${year}-12-${String(index + 1).padStart(2, '0')}`,
      day: index + 1,
      inMonth: true,
    })))
    expect(shiftCalendarDate(`${year}-12-29`, 1)).toBe(`${year}-12-30`)
    expect(shiftCalendarDate(`${year + 1}-01-01`, -1)).toBe(`${year}-12-31`)
    expect(scheduleDates({ minDate: `${year}-12-28`, maxDate: `${year + 1}-01-02`, viewDate: `${year}-12-28`, selectedDate: date, mode: 'week', events: [] })).toEqual([
      `${year}-12-28`,
      `${year}-12-29`,
      `${year}-12-30`,
      `${year}-12-31`,
      `${year + 1}-01-01`,
      `${year + 1}-01-02`,
    ])
  })

  it('keeps Gregorian leap rules and the supported schedule bounds', () => {
    expect(isCalendarDate('2000-02-29')).toBe(true)
    expect(shiftCalendarDate('2000-02-28', 1)).toBe('2000-02-29')
    expect(isCalendarDate('2100-02-29')).toBe(false)
    expect(shiftCalendarDate('2100-02-28', 1)).toBe('2100-03-01')
    expect(isCalendarDate('1969-12-31')).toBe(false)
    expect(isCalendarDate('1970-01-01')).toBe(true)
    expect(isCalendarDate('2100-12-31')).toBe(true)
    expect(isCalendarDate('2101-01-01')).toBe(false)
  })
})
