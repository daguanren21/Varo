export interface MetricCategory {
  id: string
  label: string
  value: number
  detail?: string
  disabled?: boolean
}
export interface MetricsChartProps {
  items: MetricCategory[]
  unit: string
  selectedId?: string
  title?: string
  loading?: boolean
  busy?: boolean
  disabled?: boolean
  error?: string
}
export interface MetricsChartIntent { action: 'select', id: string }

export function chartConfigurationError(items: MetricCategory[], unit: string): string {
  if (!unit.trim()) { return 'Chart configuration rejected: an explicit unit is required.' }
  if (items.length > 12) { return 'Chart configuration rejected: at most 12 categories are supported.' }
  const ids = new Set<string>()
  for (const item of items) {
    if (!item.id || ids.has(item.id) || !item.label.trim() || !Number.isFinite(item.value)) { return 'Chart configuration rejected: unique IDs, labels and finite values are required.' }
    ids.add(item.id)
  }
  return ''
}

export function chartRows(items: MetricCategory[], unit: string, selectedId: string, blocked: boolean) {
  const maximum = items.reduce((max, item) => Math.max(max, Math.abs(item.value)), 0)
  return items.map(item => ({
    ...item,
    valueText: `${item.label}: ${item.value} ${unit}`,
    selectLabel: `Inspect ${item.label}`,
    selected: item.id === selectedId,
    locked: blocked || !!item.disabled || item.id === selectedId,
    barStyle: { width: `${maximum === 0 ? 0 : Math.abs(item.value) / maximum * 100}%` },
    direction: item.value < 0 ? 'Negative' : item.value > 0 ? 'Positive' : 'Zero',
  }))
}
