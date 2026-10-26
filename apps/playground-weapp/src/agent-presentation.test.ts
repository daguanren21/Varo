// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { toRaw } from 'vue'
import AgentAttachmentList from './components/agent-ui/AgentAttachmentList.vue'
import AgentLoading from './components/agent-ui/AgentLoading.vue'
import AgentRecommendation from './components/agent-ui/AgentRecommendation.vue'

describe('native Agent presentation contracts', () => {
  it('advances elapsed time without a supplied start time and pauses when inactive', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const wrapper = mount(AgentLoading)
    try {
      await vi.advanceTimersByTimeAsync(1200)
      expect(wrapper.text()).toContain('1.2s')
      await wrapper.setProps({ active: false })
      await vi.advanceTimersByTimeAsync(1000)
      expect(wrapper.text()).toContain('1.2s')
      await wrapper.setProps({ active: true })
      expect(wrapper.text()).toContain('2.2s')
    }
    finally {
      wrapper.unmount()
      vi.useRealTimers()
    }
  })

  it('uses a supplied start time when activated', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const wrapper = mount(AgentLoading, { props: { active: false, startedAt: Date.now() - 3000 } })
    try {
      expect(wrapper.text()).toContain('0.0s')
      await wrapper.setProps({ active: true })
      expect(wrapper.text()).toContain('3.0s')
    }
    finally {
      wrapper.unmount()
      vi.useRealTimers()
    }
  })

  it('shows attachment count and metadata while keeping removal parent owned', async () => {
    const document = { id: 'document', name: 'project.pdf', size: '42 KB', mimeType: 'application/pdf' }
    const preview = { id: 'preview', name: 'preview.png', previewUrl: '/preview.png' }
    const wrapper = mount(AgentAttachmentList, { props: { attachments: [document, preview] } })
    try {
      expect(wrapper.text()).toContain('Files')
      expect(wrapper.text()).toContain('附件')
      expect(wrapper.text()).toContain('2 items')
      expect(wrapper.text()).toContain('42 KB · application/pdf')
      expect(wrapper.get('image[src="/preview.png"]').attributes('mode')).toBe('aspectFill')
      const remove = wrapper.get('button[aria-label="移除 project.pdf"]')
      expect(remove.text()).toBe('移除')
      await remove.trigger('click')
      expect(toRaw(wrapper.emitted('remove')![0]![0])).toBe(document)
      expect(wrapper.findAll('button')).toHaveLength(2)
      await wrapper.setProps({ attachments: [preview] })
      expect(wrapper.text()).toContain('1 items')
      expect(wrapper.text()).not.toContain(document.name)
      await wrapper.setProps({ attachments: [] })
      expect(wrapper.text()).toContain('0 items')
      expect(wrapper.findAll('button')).toHaveLength(0)
    }
    finally {
      wrapper.unmount()
    }
  })

  it('uses documented recommendation defaults and preserves native alternative actions', async () => {
    const alternative = { label: '另一个方案', value: 'alternative', description: '保留选项内容' }
    const wrapper = mount(AgentRecommendation, { props: { title: '推荐方案', alternatives: [alternative] } })
    try {
      expect(wrapper.text()).toContain('高置信度 · 80%')
      expect(wrapper.text()).toContain(alternative.description)
      const buttons = wrapper.findAll('button')
      await buttons.find(button => button.text() === '采用建议')!.trigger('click')
      expect(wrapper.emitted('accept')).toHaveLength(1)
      await buttons.find(button => button.text().includes(alternative.label))!.trigger('click')
      expect(toRaw(wrapper.emitted('selectAlternative')![0]![0])).toBe(alternative)
      await wrapper.setProps({ confidence: 0, acceptText: '使用方案' })
      expect(wrapper.text()).toContain('需要复核 · 0%')
      expect(wrapper.text()).toContain('使用方案')
    }
    finally {
      wrapper.unmount()
    }
  })
})
