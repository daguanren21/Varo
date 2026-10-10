export interface PersonChoice { value: string, label: string, disabled?: boolean }
export interface ManagedPerson {
  id: string
  name: string
  detail: string
  role: string
  roleLabel: string
  status: string
  statusLabel: string
  roleChoices: PersonChoice[]
  statusChoices: PersonChoice[]
  canDetail: boolean
  canApprove: boolean
  canRemove: boolean
  disabled?: boolean
  busy?: boolean
  error?: string
}
export interface PeopleFilter { id: string, label: string, disabled?: boolean }
export type PersonMutation = { action: 'role' | 'status', id: string, value: string } | { action: 'approve' | 'remove' | 'detail', id: string }
export type PeopleIntent = PersonMutation | { action: 'filter', id: string } | { action: 'close' } | { action: 'more' }
export function canRequestPerson(person: ManagedPerson, intent: PersonMutation, blocked = false): boolean {
  if (blocked || person.disabled || person.busy || person.id !== intent.id) { return false }
  switch (intent.action) {
    case 'detail': return person.canDetail
    case 'approve': return person.canApprove
    case 'remove': return person.canRemove
    case 'role': return person.role !== intent.value && person.roleChoices.some(option => option.value === intent.value && !option.disabled)
    case 'status': return person.status !== intent.value && person.statusChoices.some(option => option.value === intent.value && !option.disabled)
  }
}
