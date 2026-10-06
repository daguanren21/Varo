import type { Ref } from '@varo/shared'
import type { CheckboxRootOptions, UseCheckboxRootResult } from './types'
import { resolveReactiveRuntime } from '@varo/shared'
import { useControllableState } from '../use-controllable-state'

export function useCheckboxRoot(options: CheckboxRootOptions = {}): UseCheckboxRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const checkedState = useControllableState({
    controlled: options.checkedControlled,
    runtime,
    defaultValue: options.defaultChecked ?? false,
    value: options.checked,
    onUpdate: options.onCheckedChange,
  })
  const disabled = runtime.computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const indeterminate = runtime.computed(() => options.indeterminate?.value ?? false) as Ref<boolean>
  const readonly = runtime.computed(() => options.readonly?.value ?? false) as Ref<boolean>
  const interactive = runtime.computed(() => !disabled.value && !readonly.value) as Ref<boolean>

  function setChecked(checked: boolean) {
    if (!interactive.value) {
      return false
    }

    checkedState.current.value = checked
    return true
  }

  function getState() {
    if (indeterminate.value) {
      return 'indeterminate'
    }

    return checkedState.current.value ? 'checked' : 'unchecked'
  }

  return {
    state: {
      checked: checkedState.current,
      disabled,
      indeterminate,
      interactive,
      readonly,
    },
    attrs: {
      root: {
        'role': 'checkbox',
        get 'aria-checked'() {
          return indeterminate.value ? 'mixed' : checkedState.current.value
        },
        get 'aria-disabled'() {
          return disabled.value || undefined
        },
        get 'aria-readonly'() {
          return readonly.value || undefined
        },
        get 'data-disabled'() {
          return String(disabled.value)
        },
        get 'data-indeterminate'() {
          return String(indeterminate.value)
        },
        get 'data-readonly'() {
          return String(readonly.value)
        },
        get 'data-state'() {
          return getState()
        },
      },
      indicator: {
        'data-part': 'indicator',
        get 'data-state'() {
          return getState()
        },
      },
    },
    events: {
      toggle: () => setChecked(!checkedState.current.value),
    },
    api: {
      setChecked,
    },
  }
}
