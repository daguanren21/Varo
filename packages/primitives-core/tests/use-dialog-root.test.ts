import type { DialogOpenChangeDetails } from '../src/dialog'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useDialogRoot } from '../src/dialog'

describe('useDialogRoot', () => {
  it('reports the reason for each accepted transition exactly once', () => {
    const changes: Array<{ open: boolean, details: DialogOpenChangeDetails }> = []
    const dialog = useDialogRoot({
      onOpenChange(open, details) {
        changes.push({ open, details })
      },
    })

    dialog.events.open()
    dialog.events.close()
    dialog.events.toggle()
    dialog.events.onOverlayClick()
    dialog.api.setOpen(true)
    dialog.events.onEscapeKeyDown()
    dialog.api.setOpen(false)

    expect(changes.map(({ open, details }) => [open, details.reason])).toEqual([
      [true, 'trigger-press'],
      [false, 'close-press'],
      [true, 'trigger-press'],
      [false, 'outside-press'],
      [true, 'imperative-action'],
      [false, 'escape-key'],
    ])
    expect(changes.every(({ details }) => !details.canceled)).toBe(true)
    expect(dialog.state.open.value).toBe(false)
  })

  it('does not mutate uncontrolled state after a request is canceled', () => {
    const requests: DialogOpenChangeDetails[] = []
    const dialog = useDialogRoot({
      defaultOpen: true,
      onOpenChange(_open, nextDetails) {
        requests.push(nextDetails)
        nextDetails.cancel()
      },
    })

    dialog.events.onOverlayClick()

    expect(requests[0]?.reason).toBe('outside-press')
    expect(requests[0]?.canceled).toBe(true)
    expect(dialog.state.open.value).toBe(true)
  })

  it('keeps controlled props authoritative when a request is canceled', () => {
    const open = ref<boolean | undefined>(true)
    const onOpenChange = vi.fn((_open: boolean, details: DialogOpenChangeDetails) => {
      details.cancel()
    })
    const dialog = useDialogRoot({ open, onOpenChange })

    dialog.api.setOpen(false)

    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(dialog.state.open.value).toBe(true)

    open.value = false
    expect(dialog.state.open.value).toBe(false)
  })

  it('ignores disabled and equal-state requests', () => {
    const disabled = ref(true)
    const onOpenChange = vi.fn()
    const dialog = useDialogRoot({ disabled, onOpenChange })

    dialog.events.open()
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(dialog.state.open.value).toBe(false)

    disabled.value = false
    dialog.events.open()
    dialog.events.open()
    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(dialog.state.open.value).toBe(true)

    disabled.value = true
    dialog.events.close()
    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(dialog.state.open.value).toBe(true)
  })

  it('ignores cancellation after the request callback returns', () => {
    const requests: DialogOpenChangeDetails[] = []
    const dialog = useDialogRoot({
      onOpenChange(_open, nextDetails) {
        requests.push(nextDetails)
      },
    })

    dialog.events.open()
    requests[0]?.cancel()

    expect(requests[0]?.canceled).toBe(false)
    expect(dialog.state.open.value).toBe(true)
  })
})
