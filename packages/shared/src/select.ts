export type VSelectValue = string | number
export type VSelectMode = 'picker' | 'dropdown'

export interface VSelectOption {
  disabled?: boolean
  label: string
  value: VSelectValue
}

export type VSelectFilter = (query: string, option: VSelectOption) => boolean

export interface ToggleSelectValueOptions {
  max?: number
  multiple?: boolean
}

export interface ToggleSelectValueResult {
  changed: boolean
  limited: boolean
  value: VSelectValue | VSelectValue[] | undefined
}

export function normalizeSelectArray(value?: VSelectValue | VSelectValue[]): VSelectValue[] {
  if (Array.isArray(value)) return [...value]
  if (value === undefined) return []
  return [value]
}

export function clearSelectValue(multiple = false): VSelectValue[] | undefined {
  return multiple ? [] : undefined
}

export function toggleSelectValue(
  current: VSelectValue | VSelectValue[] | undefined,
  option: VSelectOption,
  options: ToggleSelectValueOptions = {}
): ToggleSelectValueResult {
  if (option.disabled) {
    return {
      changed: false,
      limited: false,
      value: options.multiple ? normalizeSelectArray(current) : current
    }
  }

  if (!options.multiple) {
    return {
      changed: current !== option.value,
      limited: false,
      value: option.value
    }
  }

  const values = normalizeSelectArray(current)
  const exists = values.includes(option.value)

  if (exists) {
    return {
      changed: true,
      limited: false,
      value: values.filter((value) => value !== option.value)
    }
  }

  if (options.max !== undefined && values.length >= options.max) {
    return {
      changed: false,
      limited: true,
      value: values
    }
  }

  return {
    changed: true,
    limited: false,
    value: [...values, option.value]
  }
}

export function filterSelectOptions(
  options: VSelectOption[],
  query: string,
  filterOption?: VSelectFilter
): VSelectOption[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) return options

  return options.filter((option) => {
    if (filterOption) return filterOption(normalizedQuery, option)
    return option.label.toLowerCase().includes(normalizedQuery)
  })
}

export function createSelectDisplay(
  options: VSelectOption[],
  value: VSelectValue | VSelectValue[] | undefined,
  placeholder = '请选择'
): string {
  const values = normalizeSelectArray(value)

  if (values.length === 0) return placeholder
  if (values.length >= 3) return `已选 ${values.length} 项`

  const labels = values.map((item) => options.find((option) => option.value === item)?.label ?? String(item))
  return labels.join(', ')
}
