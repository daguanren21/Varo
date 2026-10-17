export interface SummaryMetric { id: string, label: string, value: string, context: string }
export interface SummaryPeriod { id: string, label: string, disabled?: boolean }
export interface SummaryRow { id: string, title: string, detail: string }
export type SummaryIntent = { action: 'period', id: string } | { action: 'retry' }
export function canSelectSummaryPeriod(periods: SummaryPeriod[], current: string, id: string, blocked = false): boolean {
  return !blocked && current !== id && periods.some(period => period.id === id && !period.disabled)
}
