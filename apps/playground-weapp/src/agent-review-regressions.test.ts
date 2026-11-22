import type { UIMessage } from '@tanstack/ai-client'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AgentConversation from './components/agent-ui/AgentConversation.vue'
import AgentToolCallGroup from './components/agent-ui/AgentToolCallGroup.vue'
import AgentToolChip from './components/agent-ui/AgentToolChip.vue'
import { agentConversationProjection } from './components/agent-ui/presentation'

describe('native transcript regressions', () => {
  it.each(['denied', 'cancelled'] as const)('renders a standalone %s tool without a successful label or marker', (outcome) => {
    const wrapper = mount(AgentToolChip, { props: { tool: { id: 'tool', name: 'Inspect', status: 'completed', outcome } } })
    try {
      expect(wrapper.text()).toContain(outcome === 'denied' ? '已拒绝' : '已取消')
      expect(wrapper.text()).not.toContain('完成')
      expect(wrapper.get('[aria-hidden="true"]').attributes('class')).not.toContain('--varo-agent-success')
    }
    finally { wrapper.unmount() }
  })

  it('keeps empty and partial structured failures in older messages', () => {
    const messages: UIMessage[] = [
      { id: 'failed', role: 'assistant', parts: [{ type: 'structured-output', status: 'error', raw: '', errorMessage: 'Invalid structured response' }] },
      { id: 'partial', role: 'assistant', parts: [{ type: 'structured-output', status: 'error', raw: '{"title":', errorMessage: 'Interrupted JSON' }] },
      { id: 'later', role: 'assistant', parts: [{ type: 'text', content: 'Next turn' }] },
    ]
    const wrapper = mount(AgentConversation, { props: { messages } })
    try {
      expect(wrapper.text()).toContain('Invalid structured response')
      expect(wrapper.text()).toContain('Interrupted JSON')
      expect(wrapper.text()).toContain('{"title":')
      expect(agentConversationProjection(messages, messages, 'summary')[2]!.segments[0]!.content).toBe('Next turn')
    }
    finally { wrapper.unmount() }
  })

  it('displays activity progress without exposing nested SDK transcripts', async () => {
    const messages = (progress: number): UIMessage[] => [{
      id: 'progress',
      role: 'assistant',
      parts: [{ type: 'activity', activityType: 'report-progress', content: {
        title: 'Preparing report',
        progress,
        messages: [{ toolArguments: 'private-tool-arguments' }],
      } }],
    }]
    const wrapper = mount(AgentConversation, { props: { messages: messages(20) } })
    try {
      expect(wrapper.text()).toContain('Preparing report')
      expect(wrapper.text()).toContain('20%')
      await wrapper.setProps({ messages: messages(80) })
      expect(wrapper.text()).toContain('80%')
      expect(wrapper.text()).not.toContain('private-tool-arguments')
    }
    finally { wrapper.unmount() }
  })

  it.each(['denied', 'cancelled'] as const)('keeps %s separate from failures in matched and standalone tool results', (outcome) => {
    const messages: UIMessage[] = [{ id: 'call', role: 'assistant', parts: [
      { type: 'tool-call', id: 'tool', name: 'inspect', arguments: '{}', state: 'error' },
    ] }, { id: 'result', role: 'assistant', parts: [
      { type: 'tool-result', toolCallId: 'tool', state: 'error', outcome, content: 'private-tool-receipt' },
      { type: 'tool-result', toolCallId: 'orphan', name: 'orphan', state: 'error', outcome, content: 'private-orphan-receipt' },
    ] }]
    const parts = agentConversationProjection(messages, messages, 'summary').flatMap(message => message.segments)
    expect(parts.filter(part => part.tool).map(part => part.tool?.outcome)).toEqual([outcome, outcome])
    const wrapper = mount(AgentConversation, { props: { messages } })
    try {
      expect(wrapper.text()).toContain(outcome === 'denied' ? '已拒绝' : '已取消')
      expect(wrapper.text()).not.toContain('失败')
      expect(wrapper.text()).not.toContain('private-tool')
      expect(wrapper.findComponent(AgentToolCallGroup).exists()).toBe(true)
    }
    finally { wrapper.unmount() }
  })
})
