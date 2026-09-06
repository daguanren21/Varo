import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AgentComponentsDemo from './AgentComponentsDemo.vue'

describe('AgentComponentsDemo', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('streams output and lets readers resume live following', async () => {
    const wrapper = mount(AgentComponentsDemo, { props: { locale: 'zh' } })
    const transcript = wrapper.get('.ai-docs-demo__transcript')
    const transcriptElement = transcript.element as HTMLElement
    Object.defineProperties(transcriptElement, {
      clientHeight: { configurable: true, value: 240 },
      scrollHeight: { configurable: true, value: 900 },
      scrollTop: { configurable: true, value: 0, writable: true },
    })

    await vi.advanceTimersByTimeAsync(500)
    expect(wrapper.text()).toContain('varo.registry.inspect')
    expect(wrapper.get('.ai-docs-demo__hero output').attributes('data-status')).toBe('streaming')
    expect(transcriptElement.scrollTop).toBe(900)

    transcriptElement.scrollTop = 100
    await transcript.trigger('scroll')

    await wrapper.get('.ai-docs-demo__follow').trigger('click')
    await vi.advanceTimersByTimeAsync(20)
    expect(transcriptElement.scrollTop).toBe(900)
    wrapper.unmount()
  })
})
