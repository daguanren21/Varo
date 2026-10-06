import type { Ref } from '@varo/shared'
import type { ImageRootOptions, UseImageRootResult } from './types'
import { resolveReactiveRuntime } from '@varo/shared'

export function useImageRoot(options: ImageRootOptions = {}): UseImageRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const failed = runtime.ref(false)
  const loading = runtime.ref(Boolean(options.src?.value))
  const hasSource = runtime.computed(() => Boolean(options.src?.value)) as Ref<boolean>

  function reset() {
    failed.value = false
    loading.value = hasSource.value
  }

  function load() {
    failed.value = false
    loading.value = false
  }

  function error() {
    failed.value = true
    loading.value = false
  }

  return {
    state: {
      failed,
      hasSource,
      loading,
    },
    events: {
      error,
      load,
    },
    api: {
      reset,
    },
  }
}
