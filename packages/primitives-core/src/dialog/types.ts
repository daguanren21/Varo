import type { Ref } from 'vue'

export interface DialogRootOptions {
  defaultOpen?: boolean
  open?: Ref<boolean | undefined>
  disabled?: Ref<boolean | undefined>
  onOpenChange?: (open: boolean) => void
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
  setOpen: (value: boolean) => void
}

export interface UseDialogRootResult {
  state: DialogRootState
  attrs: DialogRootAttrs
  events: DialogRootEvents
  api: DialogRootApi
}
