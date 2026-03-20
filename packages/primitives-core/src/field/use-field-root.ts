import { computed, type Ref } from 'vue'
import { useControllableState } from '../use-controllable-state'
import type { FieldRootOptions, UseFieldRootResult } from './types'

export function useFieldRoot(options: FieldRootOptions = {}): UseFieldRootResult {
  const valueState = useControllableState({
    defaultValue: options.defaultValue ?? '',
    value: options.value,
    onUpdate: options.onValueChange
  })

  const disabled = computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const invalid = computed(() => options.invalid?.value ?? false) as Ref<boolean>
  const interactive = computed(() => !disabled.value) as Ref<boolean>

  function setValue(value: string) {
    if (!interactive.value) {
      return false
    }

    valueState.current.value = value
    return true
  }

  function clear() {
    setValue('')
  }

  return {
    state: {
      value: valueState.current,
      disabled,
      invalid,
      interactive
    },
    attrs: {
      input: {
        disabled: disabled.value,
        'aria-invalid': invalid.value || undefined,
        'data-disabled': String(disabled.value),
        'data-invalid': String(invalid.value)
      }
    },
    events: {
      input: setValue,
      clear
    },
    api: {
      setValue,
      clear
    }
  }
}
