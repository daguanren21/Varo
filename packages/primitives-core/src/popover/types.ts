import type { ReactiveRuntime, Ref } from '../reactive'

export interface PopoverRootOptions {
  runtime?: ReactiveRuntime
  defaultOpen?: boolean
  disabled?: Ref<boolean | undefined>
  open?: Ref<boolean | undefined>
  openControlled?: Ref<boolean | undefined>
  onOpenChange?: (open: boolean) => void
}

export interface PopoverRootState {
  disabled: Ref<boolean>
  interactive: Ref<boolean>
  open: Ref<boolean>
}

export interface PopoverRootAttrs {
  close: Record<string, unknown>
  content: Record<string, unknown>
  trigger: Record<string, unknown>
}

export interface PopoverRootEvents {
  close: () => boolean
  onEscapeKeyDown: () => boolean
  onInteractOutside: () => boolean
  open: () => boolean
  toggle: () => boolean
}

export interface PopoverRootApi {
  setOpen: (open: boolean) => boolean
}

export interface UsePopoverRootResult {
  api: PopoverRootApi
  attrs: PopoverRootAttrs
  events: PopoverRootEvents
  state: PopoverRootState
}
