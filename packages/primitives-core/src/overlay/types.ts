import type { ReactiveRuntime, Ref } from '../reactive'

export interface OverlayRootOptions {
  runtime?: ReactiveRuntime
  defaultVisible?: boolean
  visible?: Ref<boolean | undefined>
  disabled?: Ref<boolean | undefined>
  closeOnClickOverlay?: Ref<boolean | undefined>
  onVisibleChange?: (visible: boolean) => void
  onClose?: () => void
}

export interface OverlayRootState {
  visible: Ref<boolean>
  disabled: Ref<boolean>
  closeOnClickOverlay: Ref<boolean>
}

export interface OverlayRootAttrs {
  root: Record<string, unknown>
}

export interface OverlayRootEvents {
  open: () => void
  close: () => void
  toggle: () => void
  onOverlayClick: () => void
}

export interface OverlayRootApi {
  setVisible: (visible: boolean) => void
}

export interface UseOverlayRootResult {
  state: OverlayRootState
  attrs: OverlayRootAttrs
  events: OverlayRootEvents
  api: OverlayRootApi
}
