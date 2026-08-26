import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AgentComponentsDemo from './AgentComponentsDemo.vue'

describe('AgentComponentsDemo', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders the live Agent surface and all documented capabilities', async () => {
    const wrapper = mount(AgentComponentsDemo, { props: { locale: 'zh' } })

    expect(wrapper.get('.ai-docs-demo__hero').text()).toContain('真实增量事件流')
    expect(wrapper.findAll('.ai-docs-demo__ledger > div > span')).toHaveLength(37)
    expect(wrapper.text()).toContain('@varo/agent-core')
    expect(wrapper.text()).toContain('Markstream Core')
    expect(wrapper.text()).toContain('agent-events.schema.json')

    await vi.advanceTimersByTimeAsync(500)
    expect(wrapper.text()).toContain('varo.registry.inspect')
    expect(wrapper.get('.ai-docs-demo__hero output').attributes('data-status')).toBe('streaming')
    wrapper.unmount()
  })
})
