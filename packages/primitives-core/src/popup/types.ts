import type { ReactiveRuntime, Ref } from '../reactive'

export type PopupPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'
export type PopupCloseIconPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface PopupRootOptions {
  runtime?: ReactiveRuntime
  defaultVisible?: boolean
  visible?: Ref<boolean | undefined>
  visibleControlled?: Ref<boolean | undefined>
  disabled?: Ref<boolean | undefined>
  closeOnClickOverlay?: Ref<boolean | undefined>
  onVisibleChange?: (visible: boolean) => void
  onClose?: () => void
}

export interface PopupRootState {
  visible: Ref<boolean>
  disabled: Ref<boolean>
  closeOnClickOverlay: Ref<boolean>
}

export interface PopupRootAttrs {
  root: Record<string, unknown>
  overlay: Record<string, unknown>
  content: Record<string, unknown>
}

export interface PopupRootEvents {
  open: () => void
  close: () => void
  toggle: () => void
  onEscapeKeyDown: () => void
  onOverlayClick: () => void
}

export interface PopupRootApi {
  setVisible: (visible: boolean) => void
}

export interface UsePopupRootResult {
  state: PopupRootState
  attrs: PopupRootAttrs
  events: PopupRootEvents
  api: PopupRootApi
}
