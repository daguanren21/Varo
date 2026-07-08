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
  if (!value) return new Date(fallback)
  const [year, month = '1', day = '1'] = value.split('-')
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export function normalizeMonth(value?: string): string {
  const date = parseDate(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

export function shiftMonth(value: string | undefined, offset: number): string {
  const date = parseDate(normalizeMonth(value))
  date.setMonth(date.getMonth() + offset)
  return normalizeMonth(toDateString(date))
}

export function shiftYear(value: string | undefined, offset: number): string {
  const date = parseDate(normalizeMonth(value))
  date.setFullYear(date.getFullYear() + offset)
  return normalizeMonth(toDateString(date))
}

export function buildMonthDays(month?: string): CalendarDay[] {
  const normalized = normalizeMonth(month)
  const [year, monthNumber] = normalized.split('-').map(Number)
  const first = new Date(year, monthNumber - 1, 1)
  const last = new Date(year, monthNumber, 0)
  const days: CalendarDay[] = []

  for (let day = 1; day <= last.getDate(); day += 1) {
    const date = new Date(first)
    date.setDate(day)
    days.push({
      date: toDateString(date),
      day,
      inMonth: true
    })
  }

  return days
}
