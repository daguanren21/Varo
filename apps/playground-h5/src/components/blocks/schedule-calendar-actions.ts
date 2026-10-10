import { daysInMonth } from '../ui/date-utils'

export interface ScheduleEvent {
  id: string
  date: string
  label: string
  detail?: string
  available: boolean
  disabled?: boolean
  busy?: boolean
}
export interface ScheduleCalendarProps {
  minDate: string
  maxDate: string
  viewDate: string
  selectedDate: string
  mode: 'day' | 'week'
  events: ScheduleEvent[]
  disabledDates?: string[]
  selectedEventId?: string
  title?: string
  loading?: boolean
  busy?: boolean
  disabled?: boolean
  error?: string
}
export type ScheduleIntent
  = | { action: 'view', date: string, mode: 'day' | 'week' }
    | { action: 'date', date: string }
    | { action: 'choose', id: string, date: string }

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) { return false }
  const [year, month, day] = value.split('-').map(Number)
  return year >= 1970 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)
}
export function shiftCalendarDate(value: string, offset: number): string {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10)
}
export function scheduleConfigurationError(props: ScheduleCalendarProps): string {
  if (![props.minDate, props.maxDate, props.viewDate, props.selectedDate].every(isCalendarDate)
    || props.minDate > props.maxDate || props.viewDate < props.minDate || props.viewDate > props.maxDate
    || !['day', 'week'].includes(props.mode)) {
    return 'Schedule configuration rejected: valid ISO dates (1970–2100), ordered bounds and an in-bounds view are required.'
  }
  if (props.events.length > 50) { return 'Schedule configuration rejected: at most 50 injected events are supported.' }
  if ((props.disabledDates ?? []).some(date => !isCalendarDate(date))) { return 'Schedule configuration rejected: invalid disabled date.' }
  const ids = new Set<string>()
  for (const event of props.events) {
    if (!event.id || ids.has(event.id) || !event.label.trim() || !isCalendarDate(event.date)) { return 'Schedule configuration rejected: events need unique IDs, labels and valid ISO dates.' }
    ids.add(event.id)
  }
  return ''
}
export function scheduleDates(props: ScheduleCalendarProps): string[] {
  const dates: string[] = []
  const count = props.mode === 'week' ? 7 : 1
  for (let offset = 0; offset < count; offset++) {
    const date = shiftCalendarDate(props.viewDate, offset)
    if (date <= props.maxDate) { dates.push(date) }
  }
  return dates
}
export function canSelectDate(props: ScheduleCalendarProps, date: string): boolean {
  return isCalendarDate(date) && date >= props.minDate && date <= props.maxDate && !(props.disabledDates ?? []).includes(date)
}
export function canChooseEvent(props: ScheduleCalendarProps, id: string): boolean {
  const event = props.events.find(item => item.id === id)
  return !!event && event.available && !event.disabled && !event.busy && canSelectDate(props, event.date)
    && scheduleDates(props).includes(event.date) && id !== props.selectedEventId
}
