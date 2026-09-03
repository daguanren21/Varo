import type { ComputedRef, Ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'

export * from 'vue'

type MaybeReactiveBoolean = boolean | ComputedRef<boolean> | Ref<boolean> | (() => boolean)

interface ElementIntersectionObserverOptions<T> {
  enabled?: MaybeReactiveBoolean
  onObserve?: (result: T) => void
}

function resolveBoolean(value: MaybeReactiveBoolean | undefined): boolean {
  if (value === undefined) return true
  if (typeof value === 'function') return value()
  if (typeof value === 'object') return value.value
  return value
}

export function onLoad(callback: (query: Record<string, string>) => void) {
  onMounted(() => callback({}))
}

export function onPageScroll(_callback: (event: { scrollTop: number }) => void) {}

export function onUnload(callback: () => void) {
  onUnmounted(callback)
}

export function useElementIntersectionObserver<T = { intersectionRatio: number }>(
  options: ElementIntersectionObserverOptions<T>,
) {
  onMounted(() => {
    if (!resolveBoolean(options.enabled)) return
    options.onObserve?.({ intersectionRatio: 1 } as T)
  })

  return {
    disconnect() {},
    observe: () => null,
    observer: null,
  }
}
