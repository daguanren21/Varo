import { computed, ref, type Ref } from 'vue'
import { useControllableState } from '../use-controllable-state'
import type { DialogRootOptions, UseDialogRootResult } from './types'

export function useDialogRoot(options: DialogRootOptions = {}): UseDialogRootResult {
  const openState = useControllableState({
    defaultValue: options.defaultOpen ?? false,
    value: options.open,
    onUpdate: options.onOpenChange
  })

  const disabled = computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const contentId = ref('varo-dialog-content')

  function setOpen(value: boolean) {
    if (disabled.value) {
      return
    }

    openState.current.value = value
  }

  function close() {
    setOpen(false)
  }

  return {
    state: {
      open: openState.current,
      disabled
    },
    attrs: {
      trigger: {
        'aria-expanded': openState.current.value,
        'aria-controls': contentId.value
      },
      overlay: {
        'data-state': openState.current.value ? 'open' : 'closed',
        'aria-hidden': true
      },
      content: {
        id: contentId.value,
        role: 'dialog',
        tabindex: -1,
        'data-state': openState.current.value ? 'open' : 'closed'
      }
    },
    events: {
      open: () => setOpen(true),
      close,
      toggle: () => setOpen(!openState.current.value),
      onEscapeKeyDown: close,
      onOverlayClick: close
    },
    api: {
      setOpen
    }
  }
}
