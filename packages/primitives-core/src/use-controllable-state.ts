import { resolveReactiveRuntime, type ReactiveRuntime, type Ref } from './reactive'

export interface UseControllableStateOptions<T> {
  controlled?: boolean | Ref<boolean | undefined>
  runtime?: ReactiveRuntime
  defaultValue: T
  value?: Ref<T | undefined>
  onUpdate?: (value: T) => void
}

export function useControllableState<T>(options: UseControllableStateOptions<T>) {
  const runtime = resolveReactiveRuntime(options.runtime)
  const uncontrolled = runtime.ref(options.defaultValue) as Ref<T>
  const isControlled = runtime.computed(() => {
    if (typeof options.controlled === 'boolean') {
      return options.controlled
    }

    if (options.controlled) {
      return Boolean(options.controlled.value)
    }

    return options.value !== undefined
  })

  const current = runtime.computed<T>({
    get() {
      return isControlled.value ? (options.value?.value as T) : uncontrolled.value
    },
    set(value) {
      if (!isControlled.value) {
        uncontrolled.value = value
      }

      options.onUpdate?.(value)
    }
  })

  return {
    current,
    isControlled
  }
}
