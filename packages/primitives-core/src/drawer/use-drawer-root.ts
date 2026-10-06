import type { Ref } from '@varo/shared'
import type { DrawerPlacement, DrawerRootOptions, UseDrawerRootResult } from './types'
import { resolveReactiveRuntime } from '@varo/shared'
import { useDialogRoot } from '../dialog/use-dialog-root'

function normalizePlacement(value: DrawerPlacement | undefined): DrawerPlacement {
  return value ?? 'right'
}

export function useDrawerRoot(options: DrawerRootOptions = {}): UseDrawerRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const placement = runtime.computed(() => normalizePlacement(options.placement?.value)) as Ref<DrawerPlacement>
  const closeOnOverlayClick = runtime.computed(() => options.closeOnOverlayClick?.value ?? true) as Ref<boolean>
  const dialog = useDialogRoot({
    id: options.id,
    runtime,
    defaultOpen: options.defaultOpen,
    open: options.open,
    openControlled: options.openControlled,
    disabled: options.disabled,
    onOpenChange: options.onOpenChange,
  })

  return {
    state: {
      open: dialog.state.open,
      disabled: dialog.state.disabled,
      placement,
      closeOnOverlayClick,
    },
    attrs: {
      root: {
        get 'data-placement'() {
          return placement.value
        },
        get 'data-state'() {
          return dialog.state.open.value ? 'open' : 'closed'
        },
      },
      trigger: dialog.attrs.trigger,
      overlay: {
        ...dialog.attrs.overlay,
        get 'data-placement'() {
          return placement.value
        },
        get 'data-state'() {
          return dialog.state.open.value ? 'open' : 'closed'
        },
      },
      content: {
        ...dialog.attrs.content,
        get 'data-placement'() {
          return placement.value
        },
        get 'data-state'() {
          return dialog.state.open.value ? 'open' : 'closed'
        },
      },
    },
    events: {
      ...dialog.events,
      onOverlayClick: () => {
        if (closeOnOverlayClick.value) {
          dialog.events.onOverlayClick()
        }
      },
    },
    api: dialog.api,
  }
}
