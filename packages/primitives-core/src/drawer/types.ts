import type { ReactiveRuntime, Ref } from '@varo/shared'
import type { DialogOpenChangeDetails, DialogOpenChangeReason } from '../dialog/types'

export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left'

export interface DrawerRootOptions {
  id?: string
  runtime?: ReactiveRuntime
  defaultOpen?: boolean
  open?: Ref<boolean | undefined>
  openControlled?: Ref<boolean | undefined>
  placement?: Ref<DrawerPlacement | undefined>
  disabled?: Ref<boolean | undefined>
  closeOnOverlayClick?: Ref<boolean | undefined>
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void
}

export interface DrawerRootState {
  open: Ref<boolean>
  disabled: Ref<boolean>
  placement: Ref<DrawerPlacement>
  closeOnOverlayClick: Ref<boolean>
}

export interface DrawerRootAttrs {
  root: Record<string, unknown>
  trigger: Record<string, unknown>
  overlay: Record<string, unknown>
  content: Record<string, unknown>
}

export interface DrawerRootEvents {
  open: () => void
  close: () => void
  toggle: () => void
  onEscapeKeyDown: () => void
  onOverlayClick: () => void
}

export interface DrawerRootApi {
  setOpen: (value: boolean, reason?: DialogOpenChangeReason) => void
}

export interface UseDrawerRootResult {
  state: DrawerRootState
  attrs: DrawerRootAttrs
  events: DrawerRootEvents
  api: DrawerRootApi
}
