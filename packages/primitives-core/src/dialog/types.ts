import type { ReactiveRuntime, Ref } from '../reactive'

export type DialogOpenChangeReason
  = | 'trigger-press'
    | 'outside-press'
    | 'escape-key'
    | 'close-press'
    | 'imperative-action'

export interface DialogOpenChangeDetails {
  readonly reason: DialogOpenChangeReason
  readonly canceled: boolean
  cancel: () => void
}

export interface DialogRootOptions {
  id?: string
  runtime?: ReactiveRuntime
  defaultOpen?: boolean
  open?: Ref<boolean | undefined>
  openControlled?: Ref<boolean | undefined>
  disabled?: Ref<boolean | undefined>
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void
}

export interface DialogRootState {
  open: Ref<boolean>
  disabled: Ref<boolean>
}

export interface DialogRootAttrs {
  trigger: Record<string, unknown>
  overlay: Record<string, unknown>
  content: Record<string, unknown>
}

export interface DialogRootEvents {
  open: () => void
  close: () => void
  toggle: () => void
  onEscapeKeyDown: () => void
  onOverlayClick: () => void
}

export interface DialogRootApi {
  setOpen: (value: boolean, reason?: DialogOpenChangeReason) => void
}

export interface UseDialogRootResult {
  state: DialogRootState
  attrs: DialogRootAttrs
  events: DialogRootEvents
  api: DialogRootApi
}
