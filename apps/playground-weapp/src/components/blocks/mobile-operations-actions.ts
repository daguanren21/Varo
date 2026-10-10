export interface OperationField { id: string, label: string, value: string }
export interface OperationChoice { id: string, label: string, disabled?: boolean }
export type OperationActionKind = 'approve' | 'reject' | 'mutate' | 'remove' | 'open' | 'download'
export interface OperationAction {
  id: string
  kind: OperationActionKind
  label: string
  allowed: boolean
  disabled?: boolean
  completed?: boolean
  reason?: string
}
export interface OperationRecord {
  id: string
  /** Increment whenever content or grants change. */
  revision: number
  title: string
  summary: string
  detail: string
  status: string
  statusLabel: string
  category: string
  fields: OperationField[]
  actions: OperationAction[]
  canView: boolean
  disabled?: boolean
  busy?: boolean
  error?: string
}
export interface OperationFilters { search: string, status: string, category: string }
export interface OperationActionIntent {
  type: 'action'
  id: string
  revision: number
  actionId: string
  kind: OperationActionKind
}
export type OperationsIntent
  = | OperationActionIntent
    | { type: 'select', id: string, revision: number }
    | { type: 'close' }
    | { type: 'filter', filters: OperationFilters }
    | { type: 'page', page: number }

export const OPERATIONS_DEFAULT_PAGE_SIZE = 20
export const OPERATIONS_MAX_PAGE_SIZE = 50

/** Reject invalid pages instead of hiding extra records or implying virtualization. */
export function operationsPageError(items: OperationRecord[], page: number, pageSize: number, total: number): string {
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > OPERATIONS_MAX_PAGE_SIZE) { return 'Page size must be an integer from 1 to 50.' }
  if (!Number.isInteger(total) || total < 0) { return 'Total must be a non-negative integer.' }
  if (!Number.isInteger(page) || page < 1 || page > Math.max(1, Math.ceil(total / pageSize))) { return 'Current page is outside the supplied total.' }
  if (items.length > pageSize || items.length > Math.max(0, total - (page - 1) * pageSize)) { return 'The supplied page exceeds its declared bounds; no records were truncated.' }
  const ids = new Set<string>()
  for (const item of items) {
    if (!item.id || ids.has(item.id) || !Number.isInteger(item.revision) || item.revision < 0) { return 'Records require unique non-empty IDs and non-negative integer revisions.' }
    ids.add(item.id)
    if (new Set(item.actions.map(action => action.id)).size !== item.actions.length || item.actions.some(action => !action.id)) { return 'Action IDs must be non-empty and unique within a record.' }
    if (new Set(item.fields.map(field => field.id)).size !== item.fields.length || item.fields.some(field => !field.id)) { return 'Field IDs must be non-empty and unique within a record.' }
  }
  return ''
}

export function canViewOperation(item: OperationRecord | undefined, blocked = false): item is OperationRecord {
  return !!item && !blocked && item.canView && !item.disabled && !item.busy
}

/** UI eligibility only. The application must re-check its current policy and data. */
export function canRequestOperation(item: OperationRecord | undefined, intent: OperationActionIntent, blocked = false): boolean {
  if (!canViewOperation(item, blocked) || item.id !== intent.id || item.revision !== intent.revision) { return false }
  const grant = item.actions.find(action => action.id === intent.actionId && action.kind === intent.kind)
  return !!grant && grant.allowed && !grant.disabled && !grant.completed
}

export function operationFilterChanged(current: OperationFilters, next: OperationFilters): boolean {
  return current.search !== next.search || current.status !== next.status || current.category !== next.category
}
