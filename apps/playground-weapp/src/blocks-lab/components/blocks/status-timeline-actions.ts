export interface TimelineEntry {
  id: string
  title: string
  detail: string
  timeLabel: string
  status: 'pending' | 'active' | 'complete' | 'error'
  statusLabel: string
  canRetry?: boolean
  canDetail?: boolean
  disabled?: boolean
  busy?: boolean
}
export interface TimelineIntent { action: 'retry' | 'detail', id: string }
export function canRequestTimeline(entry: TimelineEntry, action: TimelineIntent['action'], blocked = false): boolean {
  if (blocked || entry.disabled || entry.busy) { return false }
  return action === 'detail' ? entry.canDetail === true : entry.status === 'error' && entry.canRetry === true
}
