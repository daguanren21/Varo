import type { Ref } from '../reactive'
import type { NumberFieldRootOptions, UseNumberFieldRootResult } from './types'
import { resolveReactiveRuntime } from '../reactive'
import { useControllableState } from '../use-controllable-state'

export function useNumberFieldRoot(options: NumberFieldRootOptions = {}): UseNumberFieldRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const disabled = runtime.computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const readonly = runtime.computed(() => options.readonly?.value ?? false) as Ref<boolean>
  const min = runtime.computed(() => options.min?.value ?? Number.NEGATIVE_INFINITY) as Ref<number>
  const max = runtime.computed(() => options.max?.value ?? Number.POSITIVE_INFINITY) as Ref<number>
  const step = runtime.computed(() => {
    const value = options.step?.value ?? 1
    return Number.isFinite(value) && value > 0 ? value : 1
  }) as Ref<number>
  const precision = runtime.computed(() => {
    const value = options.precision?.value
    return Number.isInteger(value) && Number(value) >= 0 ? Number(value) : undefined
  }) as Ref<number | undefined>
  const interactive = runtime.computed(() => !disabled.value && !readonly.value) as Ref<boolean>

  function normalize(value: number) {
    const fallback = options.value?.value ?? options.defaultValue ?? 0
    const finiteValue = Number.isFinite(value) ? value : fallback
    const bounded = Math.min(max.value, Math.max(min.value, finiteValue))
    return precision.value === undefined ? bounded : Number(bounded.toFixed(precision.value))
  }

  const valueState = useControllableState({
    controlled: options.valueControlled,
    runtime,
    defaultValue: normalize(options.defaultValue ?? 0),
    value: options.value,
    onUpdate: options.onValueChange,
  })
  const value = runtime.computed(() => normalize(valueState.current.value)) as Ref<number>
  const canDecrease = runtime.computed(() => interactive.value && value.value > min.value) as Ref<boolean>
  const canIncrease = runtime.computed(() => interactive.value && value.value < max.value) as Ref<boolean>

  function setValue(nextValue: number) {
    if (!interactive.value || !Number.isFinite(nextValue)) { return false }
    const normalized = normalize(nextValue)
    if (normalized === value.value) { return false }
    valueState.current.value = normalized
    return true
  }

  function decrement() {
    if (!canDecrease.value) { return false }
    return setValue(value.value - step.value)
  }

  function increment() {
    if (!canIncrease.value) { return false }
    return setValue(value.value + step.value)
  }

  return {
    state: {
      canDecrease,
      canIncrease,
      disabled,
      interactive,
      max,
      min,
      precision,
      readonly,
      step,
      value,
    },
    attrs: {
      root: {
        get 'data-disabled'() {
          return String(disabled.value)
        },
        get 'data-readonly'() {
          return String(readonly.value)
        },
      },
      input: {
        'role': 'spinbutton',
        get 'aria-valuemax'() {
          return Number.isFinite(max.value) ? max.value : undefined
        },
        get 'aria-valuemin'() {
          return Number.isFinite(min.value) ? min.value : undefined
        },
        get 'aria-valuenow'() {
          return value.value
        },
        get 'aria-disabled'() {
          return disabled.value || undefined
        },
        get 'aria-readonly'() {
          return readonly.value || undefined
        },
      },
      decrement: {
        'aria-label': 'Decrease value',
        get 'disabled'() {
          return !canDecrease.value
        },
      },
      increment: {
        'aria-label': 'Increase value',
        get 'disabled'() {
          return !canIncrease.value
        },
      },
    },
    events: {
      decrement,
      increment,
      input: setValue,
    },
    api: {
      decrement,
      increment,
      normalize,
      setValue,
    },
  }
}
