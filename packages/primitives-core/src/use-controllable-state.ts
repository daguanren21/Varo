import { computed, ref, type Ref } from 'vue'

export interface UseControllableStateOptions<T> {
  defaultValue: T
  value?: Ref<T | undefined>
  onUpdate?: (value: T) => void
}

export function useControllableState<T>(options: UseControllableStateOptions<T>) {
  const uncontrolled = ref(options.defaultValue) as Ref<T>
  const isControlled = computed(() => options.value?.value !== undefined)

  const current = computed<T>({
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
