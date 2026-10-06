import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useOverlayRoot } from '../src/overlay'
import { usePopupRoot } from '../src/popup'

const roots = [
  ['overlay', useOverlayRoot],
  ['popup', usePopupRoot],
] as const

describe.each(roots)('%s accepted visibility transitions', (_name, createRoot) => {
  it('ignores disabled and unchanged requests and reports each accepted transition once', () => {
    const disabled = ref(true)
    const events: Array<boolean | string> = []
    const root = createRoot({
      disabled,
      defaultVisible: false,
      onVisibleChange: visible => events.push(visible),
      onClose: () => events.push('close'),
    })

    root.events.open()
    expect(root.state.visible.value).toBe(false)
    disabled.value = false
    root.events.close()
    expect(events).toEqual([])

    root.events.open()
    root.events.open()
    expect(root.state.visible.value).toBe(true)
    root.events.close()
    root.events.close()
    expect(root.state.visible.value).toBe(false)
    expect(events).toEqual([true, false, 'close'])
  })
})
