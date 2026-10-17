export interface CalendarDay {
  date: string
  day: number
  inMonth: boolean
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseDate(value: string | undefined, fallback = new Date()): Date {
  if (!value) { return new Date(fallback) }
  const [year, month = '1', day = '1'] = value.split('-')
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export function normalizeMonth(value?: string): string {
  const [year, month] = parseDateFieldValue(value)
  return `${year}-${pad(month)}`
}

export function shiftMonth(value: string | undefined, offset: number): string {
  const [year, month] = parseDateFieldValue(value)
  const date = new Date(Date.UTC(year, month - 1 + offset, 1))
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`
}

export function shiftYear(value: string | undefined, offset: number): string {
  const [year, month] = parseDateFieldValue(value)
  const date = new Date(Date.UTC(year + offset, month - 1, 1))
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`
}

export function buildMonthDays(month?: string): CalendarDay[] {
  const normalized = normalizeMonth(month)
  const [year, monthNumber] = normalized.split('-').map(Number)
  const count = daysInMonth(year, monthNumber)
  const days: CalendarDay[] = []

  for (let day = 1; day <= count; day += 1) {
    days.push({
      date: `${normalized}-${pad(day)}`,
      day,
      inMonth: true,
    })
  }

  return days
}

export interface DateFieldOption {
  label: string
  value: number
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function clampDateParts(year: number, month: number, day: number): [number, number, number] {
  const nextMonth = Math.min(12, Math.max(1, month))
  const nextDay = Math.min(daysInMonth(year, nextMonth), Math.max(1, day))
  return [year, nextMonth, nextDay]
}

export function dateFieldValue(year: number, month: number, day: number): string {
  const [nextYear, nextMonth, nextDay] = clampDateParts(year, month, day)
  return `${nextYear}-${pad(nextMonth)}-${pad(nextDay)}`
}

export function parseDateFieldValue(value: string | undefined, fallback?: Date): [number, number, number] {
  if (!value) {
    const date = fallback ?? new Date()
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
  }
  const [year, month = '1', day = '1'] = value.split('-')
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]
}

export function buildDateFieldColumns(
  value: string | undefined,
  minYear = 1970,
  maxYear = 2100,
): DateFieldOption[][] {
  const [year, month] = parseDateFieldValue(value)
  const years: DateFieldOption[] = []
  for (let next = minYear; next <= maxYear; next += 1) {
    years.push({ label: String(next), value: next })
  }
  const months: DateFieldOption[] = Array.from({ length: 12 }, (_, index) => ({
    label: pad(index + 1),
    value: index + 1,
  }))
  const days: DateFieldOption[] = Array.from({ length: daysInMonth(year, month) }, (_, index) => ({
    label: pad(index + 1),
    value: index + 1,
  }))
  return [years, months, days]
}
