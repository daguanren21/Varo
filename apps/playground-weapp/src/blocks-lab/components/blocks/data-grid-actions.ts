export interface GridColumn { id: string, label: string, editable?: boolean, disabled?: boolean }
export interface GridRecord {
  id: string
  primary: string
  cells: Record<string, string>
  detail: string
  group?: string
  canEdit?: boolean
  disabled?: boolean
  busy?: boolean
}
export interface GridDraft { rowId: string, values: Record<string, string> }
export interface DataGridProps {
  records: GridRecord[]
  columns: GridColumn[]
  columnIds: string[]
  expandedIds: string[]
  query: string
  grouped: boolean
  page: number
  total: number
  pageSize?: number
  draft?: GridDraft | null
  fieldErrors?: Record<string, string>
  error?: string
  title?: string
  loading?: boolean
  busy?: boolean
  disabled?: boolean
}
export type GridIntent
  = | { action: 'columns', ids: string[] }
    | { action: 'expand', id: string, expanded: boolean }
    | { action: 'filter', query: string }
    | { action: 'group', grouped: boolean }
    | { action: 'page', page: number }
    | { action: 'edit', id: string }
    | { action: 'field', id: string, fieldId: string, value: string }
    | { action: 'save', id: string, values: Record<string, string> }
    | { action: 'cancel', id: string }

export function gridConfigurationError(props: DataGridProps): string {
  const pageSize = props.pageSize ?? 20
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50 || !Number.isInteger(props.total) || props.total < 0
    || !Number.isInteger(props.page) || props.page < 1 || props.page > Math.max(1, Math.ceil(props.total / pageSize))
    || props.records.length > pageSize || props.records.length > Math.max(0, props.total - (props.page - 1) * pageSize)) {
    return 'Grid configuration rejected: valid pages, totals and page size 1–50 are required; records are never truncated.'
  }
  const columnIds = new Set(props.columns.map(column => column.id))
  if (!props.columns.length || props.columns.length > 8 || columnIds.size !== props.columns.length
    || props.columns.some(column => !column.id || !column.label.trim()) || props.columnIds.some(id => !columnIds.has(id))
    || new Set(props.columnIds).size !== props.columnIds.length) {
    return 'Grid configuration rejected: supply 1–8 unique labelled columns and valid visible column IDs.'
  }
  const ids = new Set<string>()
  for (const record of props.records) {
    if (!record.id || ids.has(record.id) || !record.primary.trim() || (props.grouped && !record.group?.trim())) { return 'Grid configuration rejected: records need unique IDs, primary labels and group labels when grouped.' }
    ids.add(record.id)
  }
  return ''
}
export function canEditRecord(props: DataGridProps, id: string): boolean {
  const record = props.records.find(item => item.id === id)
  return !props.loading && !props.busy && !props.disabled && !!record && !!record.canEdit && !record.disabled && !record.busy
}
export function gridSections(records: GridRecord[], grouped: boolean) {
  if (!grouped) { return [{ id: 'all', label: '', records }] }
  const groups = new Map<string, GridRecord[]>()
  for (const record of records) {
    const label = record.group ?? ''
    const rows = groups.get(label)
    if (rows) {
      rows.push(record)
    }
    else { groups.set(label, [record]) }
  }
  return Array.from(groups, ([label, rows]) => ({ id: label, label, records: rows }))
}

export function gridIntentAllowed(props: DataGridProps, intent: GridIntent): boolean {
  if (intent.action === 'cancel') { return props.draft?.rowId === intent.id }
  if (intent.action === 'expand' && !intent.expanded) { return props.expandedIds.includes(intent.id) }
  if (props.disabled || props.loading || props.busy || gridConfigurationError(props)) { return false }
  switch (intent.action) {
    case 'filter': return !props.draft && intent.query !== props.query
    case 'group': return !props.draft && intent.grouped !== props.grouped
    case 'page': return !props.draft && Number.isInteger(intent.page) && intent.page >= 1
      && intent.page <= Math.max(1, Math.ceil(props.total / (props.pageSize ?? 20))) && intent.page !== props.page
    case 'columns': return new Set(intent.ids).size === intent.ids.length
      && intent.ids.every(id => props.columns.some(column => column.id === id))
      && props.columns.every(column => !column.disabled || intent.ids.includes(column.id) === props.columnIds.includes(column.id))
      && (intent.ids.length !== props.columnIds.length || intent.ids.some((id, index) => id !== props.columnIds[index]))
    case 'expand': return !props.expandedIds.includes(intent.id)
      && props.records.some(record => record.id === intent.id && !record.disabled && !record.busy)
    case 'edit': return !props.draft && canEditRecord(props, intent.id)
    case 'field': return props.draft?.rowId === intent.id && canEditRecord(props, intent.id)
      && props.columns.some(column => column.id === intent.fieldId && column.editable && !column.disabled)
      && props.draft.values[intent.fieldId] !== intent.value
    case 'save': {
      const record = props.records.find(row => row.id === intent.id)
      if (!record || props.draft?.rowId !== intent.id || !canEditRecord(props, intent.id)) { return false }
      let changed = false
      for (const fieldId in intent.values) {
        if (!Object.hasOwn(intent.values, fieldId) || intent.values[fieldId] === record.cells[fieldId]) { continue }
        const column = props.columns.find(item => item.id === fieldId)
        if (!column?.editable || column.disabled) { return false }
        changed = true
      }
      return changed
    }
  }
}
