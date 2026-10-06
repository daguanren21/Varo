import type { Ref } from '@varo/shared'
import type { FieldRootOptions, UseFieldRootResult } from './types'
import { resolveReactiveRuntime } from '@varo/shared'
import { useControllableState } from '../use-controllable-state'

export function useFieldRoot(options: FieldRootOptions = {}): UseFieldRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const valueState = useControllableState({
    controlled: options.valueControlled,
    runtime,
    defaultValue: options.defaultValue ?? '',
    value: options.value,
    onUpdate: options.onValueChange,
  })

  const disabled = runtime.computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const readonly = runtime.computed(() => options.readonly?.value ?? false) as Ref<boolean>
  const invalid = runtime.computed(() => options.invalid?.value ?? false) as Ref<boolean>
  const interactive = runtime.computed(() => !disabled.value && !readonly.value) as Ref<boolean>

  function setValue(value: string) {
    if (!interactive.value || value === valueState.current.value) {
      return false
    }

    valueState.current.value = value
    return true
  }

  function clear() {
    return setValue('')
  }

  return {
    state: {
      value: valueState.current,
      disabled,
      readonly,
      invalid,
      interactive,
    },
    attrs: {
      input: {
        'disabled': disabled.value,
        'readonly': readonly.value,
        'aria-invalid': invalid.value || undefined,
        'data-disabled': String(disabled.value),
        'data-readonly': String(readonly.value),
        'data-invalid': String(invalid.value),
      },
    },
    events: {
      input: setValue,
      clear,
    },
    api: {
      setValue,
      clear,
    },
  }
}
