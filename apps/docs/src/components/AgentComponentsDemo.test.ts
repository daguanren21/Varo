import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AgentComponentsDemo from './AgentComponentsDemo.vue'

describe('AgentComponentsDemo', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

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
