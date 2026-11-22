import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'wevu'
import { useModelCompareDemo } from './useModelCompareDemo'

describe('model comparison disposal', () => {
  it('rejects queued client replacement after close and keeps controls disabled', () => {
    let model!: ReturnType<typeof useModelCompareDemo>
    const wrapper = mount(defineComponent({ setup() { model = useModelCompareDemo(); return () => null } }))
    try {
      expect(model.toolExampleDisabled.value).toBe(false)
      model.advanceToolExample()
      const before = [model.leftState.value, model.rightState.value]
      model.close()
      const notice = model.notice.value
      model.replaceLeftToolExample()
      model.advanceToolExample()
      model.newConversation()
      expect(model.toolExampleDisabled.value).toBe(true)
      expect(model.leftState.value.sessionId).toBe(before[0].sessionId)
      expect(model.rightState.value.sessionId).toBe(before[1].sessionId)
      expect(model.visible.value).toBe(false)
      expect(model.notice.value).toBe(notice)
    }
    finally { wrapper.unmount() }
  })
})
