export interface Ref<T> {
  value: T
}

export type MaybeRef<T> = T | Ref<T>

export interface WritableRef<T> extends Ref<T> {
  value: T
}

export interface ReactiveRuntime {
  ref: <T>(value: T) => WritableRef<T>
  computed: {
    <T>(getter: () => T): Ref<T>
    <T>(options: { get: () => T; set: (value: T) => void }): WritableRef<T>
  }
}

export function ref<T>(value: T): WritableRef<T> {
  return { value }
}

export function computed<T>(getter: () => T): Ref<T>
export function computed<T>(options: { get: () => T; set: (value: T) => void }): WritableRef<T>
export function computed<T>(source: (() => T) | { get: () => T; set: (value: T) => void }) {
  if (typeof source === 'function') {
    return {
      get value() {
        return source()
      }
    }
  }

  return {
    get value() {
      return source.get()
    },
    set value(value: T) {
      source.set(value)
    }
  }
}

export const defaultReactiveRuntime: ReactiveRuntime = {
  ref,
  computed
}

export function resolveReactiveRuntime(runtime?: ReactiveRuntime): ReactiveRuntime {
  return runtime ?? defaultReactiveRuntime
}

export function readMaybeRef<T>(source: MaybeRef<T>): T {
  return typeof source === 'object' && source !== null && 'value' in source
    ? source.value
    : source
}
