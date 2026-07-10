import type { ReactiveRuntime, Ref } from '../reactive'

export interface CollapsibleRootOptions {
  runtime?: ReactiveRuntime
  defaultOpen?: boolean
  disabled?: Ref<boolean | undefined>
  open?: Ref<boolean | undefined>
  openControlled?: Ref<boolean | undefined>
  onOpenChange?: (open: boolean) => void
}

export interface CollapsibleRootState {
  disabled: Ref<boolean>
  interactive: Ref<boolean>
  open: Ref<boolean>
}

export interface CollapsibleRootAttrs {
  content: Record<string, unknown>
  root: Record<string, unknown>
  trigger: Record<string, unknown>
}

export interface CollapsibleRootEvents {
  close: () => boolean
  open: () => boolean
  toggle: () => boolean
}

export interface CollapsibleRootApi {
  setOpen: (open: boolean) => boolean
}

export interface UseCollapsibleRootResult {
  api: CollapsibleRootApi
  attrs: CollapsibleRootAttrs
  events: CollapsibleRootEvents
  state: CollapsibleRootState
}
