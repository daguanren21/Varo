export interface SettingOption { value: string, label: string, disabled?: boolean }
interface SettingBase { id: string, label: string, description?: string, disabled?: boolean, pending?: boolean, error?: string }
export type SettingEntry = SettingBase & (
  | { kind: 'boolean', value: boolean }
  | { kind: 'choice', value: string, options: SettingOption[] }
  | { kind: 'readonly', value: string }
)
export interface SettingChange { id: string, value: string | boolean }

export function canChangeSetting(entry: SettingEntry, value: string | boolean, blocked = false): boolean {
  if (blocked || entry.disabled || entry.pending || entry.kind === 'readonly' || entry.value === value) { return false }
  if (entry.kind === 'boolean') { return typeof value === 'boolean' }
  return typeof value === 'string' && entry.options.some(option => option.value === value && !option.disabled)
}
