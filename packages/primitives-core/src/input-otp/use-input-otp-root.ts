import type { Ref } from '@varo/shared'
import type { InputOtpPattern, InputOtpRootOptions, UseInputOtpRootResult } from './types'
import { resolveReactiveRuntime } from '@varo/shared'
import { useControllableState } from '../use-controllable-state'

function normalizeLength(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) {
    return 6
  }

  return Math.max(1, Math.trunc(value))
}

function matchesPattern(value: string, pattern: InputOtpPattern | undefined) {
  if (!pattern) {
    return true
  }

  const expression = pattern instanceof RegExp ? pattern : new RegExp(pattern)
  expression.lastIndex = 0
  return expression.test(value)
}

function normalizeValue(value: string, length: number, pattern: InputOtpPattern | undefined) {
  return [...value]
    .filter(character => matchesPattern(character, pattern))
    .slice(0, length)
    .join('')
}

export function useInputOtpRoot(options: InputOtpRootOptions = {}): UseInputOtpRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const length = runtime.computed(() => normalizeLength(options.length?.value)) as Ref<number>
  const pattern = runtime.computed(() => options.pattern?.value) as Ref<InputOtpPattern | undefined>
  const inputMode = runtime.computed(() => options.inputMode?.value ?? 'numeric')
  const disabled = runtime.computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const invalid = runtime.computed(() => options.invalid?.value ?? false) as Ref<boolean>
  const readonly = runtime.computed(() => options.readonly?.value ?? false) as Ref<boolean>
  const interactive = runtime.computed(() => !disabled.value && !readonly.value) as Ref<boolean>
  const valueState = useControllableState({
    controlled: options.valueControlled,
    runtime,
    defaultValue: normalizeValue(options.defaultValue ?? '', length.value, pattern.value),
    value: options.value,
    onUpdate: options.onValueChange,
  })
  const focused = runtime.ref(false)
  const activeIndex = runtime.computed(() => Math.min(valueState.current.value.length, length.value)) as Ref<number>
  const complete = runtime.computed(() => valueState.current.value.length === length.value) as Ref<boolean>

  function setValue(value: string) {
    if (!interactive.value) {
      return false
    }

    const nextValue = normalizeValue(value, length.value, pattern.value)
    if (nextValue === valueState.current.value) {
      return false
    }

    valueState.current.value = nextValue
    if (nextValue.length === length.value) {
      options.onComplete?.(nextValue)
    }
    return true
  }

  return {
    state: {
      value: valueState.current,
      length,
      activeIndex,
      complete,
      disabled,
      invalid,
      interactive,
      readonly,
      focused,
    },
    attrs: {
      root: {
        'role': 'group',
        get 'aria-disabled'() {
          return disabled.value || undefined
        },
        get 'aria-invalid'() {
          return invalid.value || undefined
        },
        get 'aria-readonly'() {
          return readonly.value || undefined
        },
        get 'data-complete'() {
          return String(complete.value)
        },
        get 'data-disabled'() {
          return String(disabled.value)
        },
        get 'data-focused'() {
          return String(focused.value)
        },
        get 'data-invalid'() {
          return String(invalid.value)
        },
        get 'data-length'() {
          return String(length.value)
        },
        get 'data-readonly'() {
          return String(readonly.value)
        },
        get 'data-state'() {
          if (disabled.value) {
            return 'disabled'
          }
          if (invalid.value) {
            return 'invalid'
          }
          if (complete.value) {
            return 'complete'
          }
          return 'incomplete'
        },
      },
      input: {
        'autocomplete': 'one-time-code',
        get 'aria-label'() {
          return options.accessibleLabel?.value ?? 'One-time password'
        },
        get 'disabled'() {
          return disabled.value || undefined
        },
        get 'inputmode'() {
          return inputMode.value
        },
        get 'maxlength'() {
          return length.value
        },
        get 'readonly'() {
          return readonly.value || undefined
        },
        get 'spellcheck'() {
          return false
        },
      },
    },
    events: {
      input: setValue,
      clear: () => setValue(''),
      focus: () => {
        focused.value = true
      },
      blur: () => {
        focused.value = false
      },
    },
    api: {
      setValue,
    },
  }
}
