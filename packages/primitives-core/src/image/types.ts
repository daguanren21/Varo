import type { ReactiveRuntime, Ref } from '../reactive'

export interface ImageRootOptions {
  runtime?: ReactiveRuntime
  src?: Ref<string | undefined>
}

export interface ImageRootState {
  failed: Ref<boolean>
  hasSource: Ref<boolean>
  loading: Ref<boolean>
}

export interface ImageRootApi {
  reset: () => void
}

export interface ImageRootEvents {
  error: () => void
  load: () => void
}

export interface UseImageRootResult {
  api: ImageRootApi
  events: ImageRootEvents
  state: ImageRootState
}
