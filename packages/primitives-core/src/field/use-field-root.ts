import { resolveReactiveRuntime, type Ref } from '../reactive'
import { useControllableState } from '../use-controllable-state'
import type { FieldRootOptions, UseFieldRootResult } from './types'

export function useFieldRoot(options: FieldRootOptions = {}): UseFieldRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const valueState = useControllableState({
    runtime,
    defaultValue: options.defaultValue ?? '',
    value: options.value,
    onUpdate: options.onValueChange
  })

  const disabled = runtime.computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const invalid = runtime.computed(() => options.invalid?.value ?? false) as Ref<boolean>
  const interactive = runtime.computed(() => !disabled.value) as Ref<boolean>

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
