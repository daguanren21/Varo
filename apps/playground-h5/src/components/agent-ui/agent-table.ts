export interface AgentTableColumn {
  key: string
  label: string
  sortable?: boolean
}

export interface AgentTableRow {
  id: string
  [key: string]: unknown
}

export interface AgentFilterOption {
  count?: number
  label: string
  value: string
}

export function agentTableCellValue(row: AgentTableRow, key: string) {
  const value = row[key]
  if (value === null || value === undefined) return '—'
  if (Array.isArray(value)) return value.join(', ')
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}
