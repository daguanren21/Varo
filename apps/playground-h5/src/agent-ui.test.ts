// @vitest-environment jsdom

import type { AgentStreamSnapshot } from '@varo-ui/ai'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { AgentComposer, AgentEventRenderer, AgentFileDiff, AgentMarkdown, AgentThinking } from './components/agent-ui'
import AgentChat from './components/blocks/agent-chat.vue'

describe('H5 Agent UI', () => {
  it('renders structured Markdown without injecting unsafe links', () => {
    const wrapper = mount(AgentMarkdown, {
      props: {
        content: '## 结果\n\n| 平台 | 状态 |\n| --- | --- |\n| H5 | **完成** |\n\n[危险链接](javascript:alert(1))',
        final: true,
      },
    })

    expect(wrapper.get('h2').text()).toBe('结果')
    expect(wrapper.get('table').text()).toContain('H5')
    expect(wrapper.get('strong').text()).toBe('完成')
    expect(wrapper.find('a[href^="javascript:"]').exists()).toBe(false)
  })

  it('composes reasoning, tools, streaming content, and approval state', async () => {
    const snapshot: AgentStreamSnapshot = {
      approval: {
        choices: [{ label: '仅验证', value: 'verify' }],
        id: 'approval',
        status: 'waiting',
        title: '确认发布',
      },
      data: [],
      eventCount: 8,
      message: {
        final: false,
        id: 'message',
        role: 'assistant',
        source: '**发布计划**',
        visible: '**发布计划**',
      },
      reasoning: [{ content: '检查 Registry', id: 'reason', status: 'completed', title: '分析依赖' }],
      status: 'waiting',
      tools: [{ id: 'tool', name: 'registry.inspect', status: 'completed', summary: '双端通过' }],
    }
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })

    await wrapper.findAll('button').find(button => button.text().includes('推理过程'))!.trigger('click')
    expect(wrapper.text()).toContain('分析依赖')
    expect(wrapper.text()).toContain('registry.inspect')
    expect(wrapper.get('.agent-markdown__strong').text()).toBe('发布计划')
    expect(wrapper.text()).toContain('确认发布')

    await wrapper.get('input[type="radio"]').setValue(true)
    await wrapper.findAll('button').find(button => button.text() === '确认')!.trigger('click')
    expect(wrapper.emitted('approve')?.[0]).toEqual(['verify'])
  })

  it('submits explicit composer input and prompt suggestions', async () => {
    const composer = mount(AgentComposer, {
      props: { modelValue: '分析双端方案', suggestions: ['生成发布计划'] },
    })

    await composer.get('button[aria-label="发送"]').trigger('click')
    expect(composer.emitted('submit')?.[0]).toEqual(['分析双端方案'])

    await composer.findAll('button').find(button => button.text() === '生成发布计划')!.trigger('click')
    expect(composer.emitted('submit')?.[1]).toEqual(['生成发布计划'])
  })

  it('reviews diffs in unified and split layouts', async () => {
    const lines = [
      { content: '@@ -17,2 +17,3 @@ stream', type: 'hunk' as const },
      { content: 'status: \'idle\'', id: 'old', oldNumber: 17, type: 'remove' as const },
      { content: 'status: \'streaming\'', id: 'new', newNumber: 17, type: 'add' as const },
      { content: 'schedule(frame)', newNumber: 18, type: 'add' as const },
      { collapsedLines: 12, content: '@@ More context', id: 'context', type: 'hunk' as const },
    ]
    const wrapper = mount(AgentFileDiff, {
      props: { filename: 'src/runtime/stream.ts', lines },
    })

    expect(wrapper.get('.agent-file-diff__counts').text()).toBe('+2−1')
    expect(wrapper.findAll('.agent-file-diff__inline-change').map(node => node.text())).toEqual(['idle', 'streaming'])

    await wrapper.findAll('.agent-file-diff__segmented button')[1].trigger('click')
    expect(wrapper.attributes('data-view')).toBe('split')
    expect(wrapper.emitted('update:view')?.[0]).toEqual(['split'])
    expect(wrapper.findAll('.agent-file-diff__split-row')).toHaveLength(2)

    await wrapper.get('.agent-file-diff__side[data-type="remove"]').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ index: 1, side: 'old' })

    await wrapper.findAll('.agent-file-diff__hunk')[1].trigger('click')
    expect(wrapper.emitted('expand')?.[0]).toEqual([lines[4], 4])
  })

  it('keeps controlled diff state parent-owned', async () => {
    const wrapper = mount(AgentFileDiff, {
      props: {
        filename: 'src/controlled.ts',
        lines: [{ content: 'const ready = true', newNumber: 1, type: 'add' }],
        open: false,
        view: 'unified',
      },
    })

    expect(wrapper.find('.agent-file-diff__body').exists()).toBe(false)
    await wrapper.setProps({ open: true })
    await wrapper.findAll('.agent-file-diff__segmented button')[1].trigger('click')

    expect(wrapper.attributes('data-view')).toBe('unified')
    expect(wrapper.emitted('update:view')?.[0]).toEqual(['split'])
  })

  it('renders a padded thinking disclosure with real SVG icons', async () => {
    const wrapper = mount(AgentThinking, {
      props: {
        className: 'rounded-none shadow-none',
        defaultOpen: true,
        steps: [{ id: 'registry', title: '检查 Registry', detail: '已读取组件清单', status: 'completed' }],
      },
    })

    expect(wrapper.classes()).toContain('rounded-none')
    expect(wrapper.classes()).not.toContain('rounded-2xl')
    expect(wrapper.get('.agent-thinking__icon svg').attributes('viewBox')).toBe('0 0 24 24')
    expect(wrapper.find('.agent-thinking__body').exists()).toBe(true)

    await wrapper.get('.agent-thinking__trigger').trigger('click')
    expect(wrapper.find('.agent-thinking__body').exists()).toBe(false)
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('ships the Agent Chat block as a complete conversation shell', async () => {
    const wrapper = mount(AgentChat, {
      props: {
        messages: [{ content: '欢迎使用', id: 'welcome', role: 'assistant' }],
        suggestions: ['分析需求'],
        title: '项目 Agent',
      },
    })

    expect(wrapper.get('[aria-label="Agent conversation"]').text()).toContain('项目 Agent')
    expect(wrapper.text()).toContain('欢迎使用')
    await wrapper.get('textarea').setValue('生成方案')
    await wrapper.get('button[aria-label="发送"]').trigger('click')
    expect(wrapper.emitted('submit')?.[0]).toEqual(['生成方案'])
  })
})
