export interface StepFormOption { value: string, label: string, disabled?: boolean }
interface StepFieldBase { id: string, label: string, description?: string, disabled?: boolean }
export type StepFormField = StepFieldBase & (
  | { kind: 'text', placeholder?: string, maxLength?: number }
  | { kind: 'choice', options: StepFormOption[] }
  | { kind: 'boolean' }
)
export interface StepFormStep { id: string, title: string, description?: string, fields: StepFormField[], disabled?: boolean }
export type StepFormValues = Record<string, string | boolean>
export type StepFormIntent
  = | { action: 'change', stepId: string, fieldId: string, value: string | boolean }
    | { action: 'previous' | 'next' | 'submit', stepId: string, position: number, values: StepFormValues }

export function canChangeStepField(field: StepFormField, value: string | boolean, values: StepFormValues, blocked = false): boolean {
  if (blocked || field.disabled || values[field.id] === value) { return false }
  if (field.kind === 'boolean') { return typeof value === 'boolean' }
  if (typeof value !== 'string') { return false }
  return field.kind === 'text' || field.options.some(option => option.value === value && !option.disabled)
}
export function canNavigateStepForm(steps: StepFormStep[], position: number, action: 'previous' | 'next' | 'submit', blocked = false): boolean {
  const step = steps[position]
  if (blocked || !Number.isInteger(position) || !step) { return false }
  if (action === 'previous') { return position > 0 }
  if (step.disabled) { return false }
  return action === 'next' ? position < steps.length - 1 : position === steps.length - 1
}
