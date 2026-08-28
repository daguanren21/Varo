import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AgentComponentsDemo from './AgentComponentsDemo.vue'

describe('AgentComponentsDemo', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders the live Agent surface and all documented capabilities', async () => {
    const wrapper = mount(AgentComponentsDemo, { props: { locale: 'zh' } })
    const transcript = wrapper.get('.ai-docs-demo__transcript')
    const transcriptElement = transcript.element as HTMLElement
    Object.defineProperties(transcriptElement, {
      clientHeight: { configurable: true, value: 240 },
      scrollHeight: { configurable: true, value: 900 },
      scrollTop: { configurable: true, value: 0, writable: true },
    })

    expect(wrapper.get('.ai-docs-demo__hero').text()).toContain('真实增量事件流')
    expect(wrapper.findAll('.ai-docs-demo__ledger > div > span')).toHaveLength(37)
    expect(wrapper.text()).toContain('@varo-ui/ai')
    expect(wrapper.text()).toContain('Markstream Core')
    expect(wrapper.text()).toContain('agent-events.schema.json')

    await vi.advanceTimersByTimeAsync(500)
    expect(wrapper.text()).toContain('varo.registry.inspect')
    expect(wrapper.get('.ai-docs-demo__hero output').attributes('data-status')).toBe('streaming')
    expect(transcriptElement.scrollTop).toBe(900)

    transcriptElement.scrollTop = 100
    await transcript.trigger('scroll')
    expect(wrapper.get('.ai-docs-demo__follow').text()).toContain('跳到最新')

    await wrapper.get('.ai-docs-demo__follow').trigger('click')
    await vi.advanceTimersByTimeAsync(20)
    expect(transcriptElement.scrollTop).toBe(900)
    wrapper.unmount()
  })
})
