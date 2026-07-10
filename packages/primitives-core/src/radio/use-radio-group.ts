import { resolveReactiveRuntime, type Ref } from '../reactive'
import { useControllableState } from '../use-controllable-state'
import type { RadioGroupOptions, RadioValue, UseRadioGroupResult } from './types'

export function useRadioGroup(options: RadioGroupOptions = {}): UseRadioGroupResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const valueState = useControllableState<RadioValue | undefined>({
    controlled: options.valueControlled,
    runtime,
    defaultValue: options.defaultValue,
    value: options.value,
    onUpdate: options.onValueChange
  })
  const disabled = runtime.computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const interactive = runtime.computed(() => !disabled.value) as Ref<boolean>

  function isChecked(value: RadioValue) {
    return valueState.current.value === value
  }

  function select(value: RadioValue) {
    if (!interactive.value || isChecked(value)) {
      return false
    }

    valueState.current.value = value
    return true
  }

  function getItemState(value: RadioValue) {
    return isChecked(value) ? 'checked' : 'unchecked'
  }

  function getItemAttrs(value: RadioValue, itemDisabled = false) {
    const disabledValue = disabled.value || itemDisabled
    const checked = isChecked(value)

    return {
      role: 'radio',
      'aria-checked': checked,
      'aria-disabled': disabledValue || undefined,
      'data-disabled': String(disabledValue),
      'data-state': getItemState(value),
      'data-value': String(value)
    }
  }

  function getIndicatorAttrs(value: RadioValue) {
    return {
      'data-part': 'indicator',
      'data-state': getItemState(value)
    }
  }

  return {
    state: {
      disabled,
      interactive,
      value: valueState.current
    },
    attrs: {
      root: {
        role: 'radiogroup',
        get 'data-disabled'() {
          return String(disabled.value)
        }
      }
    },
    events: {
      select
    },
    api: {
      getIndicatorAttrs,
      getItemAttrs,
      select
    }
  }
}
