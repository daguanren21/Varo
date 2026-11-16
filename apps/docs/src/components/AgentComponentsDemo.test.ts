import type { AgentDocsDemoController } from '../composables/useAgentDocsDemo'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useAgentDocsDemo } from '../composables/useAgentDocsDemo'
import AgentComponentsDemo from './AgentComponentsDemo.vue'

describe('AgentComponentsDemo', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it.each(['approve', 'reject'] as const)('completes the original SDK tool receipt after %s with a distinct interrupt ID', async (decision) => {
    let demo!: AgentDocsDemoController
    const wrapper = mount(defineComponent({ setup() { demo = useAgentDocsDemo('生成本地发布计划'); return () => h('div') } }))
    try {
      await vi.runAllTimersAsync()
      const approval = demo.snapshot.value.interruptState.interrupts[0]!
      if (approval.kind !== 'tool-approval') { throw new Error('Expected bound approval') }
      expect(approval.id).not.toBe(approval.toolCallId)
      expect(demo[decision](approval.id)).toBe(true)
      await vi.runAllTimersAsync()
      const parts = demo.snapshot.value.messages.flatMap(message => message.parts)
      const call = parts.filter(part => part.type === 'tool-call').find(part => part.id === approval.toolCallId)
      const result = parts.filter(part => part.type === 'tool-result').find(part => part.toolCallId === approval.toolCallId)
      expect(call?.state).toBe(decision === 'approve' ? 'complete' : 'error')
      expect(result?.state).toBe(decision === 'approve' ? 'complete' : 'error')
      if (decision === 'reject') { expect(result?.outcome).toBe('denied') }
      expect(demo.snapshot.value.interruptState.interrupts).toHaveLength(0)
      expect(demo.messages.value.some(message => message.parts.some(part => part.type === 'tool-call' && part.id === approval.toolCallId))).toBe(true)
      demo.run('下一个问题')
      await vi.runAllTimersAsync()
      expect(demo.messages.value.some(message => message.parts.some(part => part.type === 'tool-result' && part.toolCallId === approval.toolCallId))).toBe(true)
    }
    finally { wrapper.unmount() }
  })

  it('streams output and lets readers resume live following', async () => {
    const wrapper = mount(AgentComponentsDemo, { props: { locale: 'zh' } })
    const modes = wrapper.findAll('.ai-docs-demo__mode')
    expect(modes).toHaveLength(2)
    expect(modes[0]!.get('h3').text()).toBe('Chat 模式')
    expect(modes[1]!.get('h3').text()).toBe('RAG 模式')
    expect(wrapper.find('.ai-docs-demo__workspace').exists()).toBe(false)
    expect(wrapper.find('.ai-docs-demo__ledger').exists()).toBe(false)
    const transcript = wrapper.get('.ai-docs-demo__transcript')
    const transcriptElement = transcript.element as HTMLElement
    Object.defineProperties(transcriptElement, {
      clientHeight: { configurable: true, value: 240 },
      scrollHeight: { configurable: true, value: 900 },
      scrollTop: { configurable: true, value: 0, writable: true },
    })

    await vi.advanceTimersByTimeAsync(500)
    expect(wrapper.text()).toContain('local.docs.preview')
    expect(wrapper.get('.ai-docs-demo__mode-head output').attributes('data-status')).toBe('streaming')
    expect(transcriptElement.scrollTop).toBe(900)

    transcriptElement.scrollTop = 100
    await transcript.trigger('scroll')

    await wrapper.get('.ai-docs-demo__follow').trigger('click')
    await vi.advanceTimersByTimeAsync(20)
    expect(transcriptElement.scrollTop).toBe(900)
    expect(wrapper.get('[data-rag-stage="generate"]').attributes('data-status')).toBe('completed')
    expect(wrapper.get('[data-rag-source="support"]').text()).toContain('客服工单')

    wrapper.unmount()
  })

  it.each([
    ['approve', '已记录本地审批决定；未执行任何检查、构建或发布。'],
    ['reject', '已拒绝本地演示操作，没有产生外部副作用。'],
  ])('resumes an English release request after a live SDK %s decision', async (decision, result) => {
    const wrapper = mount(AgentComponentsDemo, { props: { locale: 'en' } })
    try {
      await vi.advanceTimersByTimeAsync(5000)
      expect(wrapper.get('.ai-docs-demo__mode-head output').text()).toBe('ready')
      await wrapper.get('textarea').setValue('Generate a release plan')
      await wrapper.get('button[aria-label="发送"]').trigger('click')
      await vi.advanceTimersByTimeAsync(5000)
      expect(wrapper.get('.agent-approval__title').text()).toContain('local.docs.release-preview')
      await wrapper.get(`.agent-approval__${decision}`).trigger('click')
      await vi.advanceTimersByTimeAsync(200)
      expect(wrapper.find('.agent-approval').exists()).toBe(false)
      expect(wrapper.get('.ai-docs-demo__transcript').text()).toContain(result)
      expect(wrapper.get('.ai-docs-demo__mode-head output').attributes('data-status')).toBe('ready')
    }
    finally {
      wrapper.unmount()
    }
  })
})
