import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { agentDemoCatalog } from '../agent-component-catalog'
import AgentComponentDemo from './AgentComponentDemo.vue'

const components = [
  'loading',
  'thinking',
  'markdown',
  'stream',
  'message',
  'conversation',
  'tool-chip',
  'task-list',
  'radio-group',
  'approval',
  'recommendation',
  'prompt-suggestions',
  'composer',
  'response-actions',
  'artifact',
  'sources',
  'attachments',
  'event-renderer',
  'message-scroller',
  'code-block',
  'file-diff',
  'tool-result',
  'image-generation',
  'tool-approval',
  'citations',
  'activity',
  'sidebar',
  'context-card',
  'insight-card',
  'selection-actions',
  'diff-table',
  'records-table',
  'filter-table',
  'command-search',
  'flowchart',
  'fine-tune',
  'agent-chat',
]

describe('AgentComponentDemo', () => {
  it('renders a real demo for every documented Agent surface', async () => {
    for (const component of components) {
      const wrapper = mount(AgentComponentDemo, { props: { component } })
      expect(wrapper.attributes('data-demo')).toBe(component)
      expect(wrapper.get('.agent-component-demo__stage').text().trim().length, component).toBeGreaterThan(0)
      await wrapper.findAll('button').find(button => button.text() === 'Code')!.trigger('click')
      expect(wrapper.get('.agent-component-demo__source').text(), component).toContain(agentDemoCatalog[component].name)
      expect(wrapper.get('.agent-component-demo__source').text(), component).toContain(agentDemoCatalog[component].importPath)
      wrapper.unmount()
    }
  })

  it('forwards interactive demo output', async () => {
    const wrapper = mount(AgentComponentDemo, { props: { component: 'prompt-suggestions' } })
    await wrapper.findAll('button').find(button => button.text() === '分析双端能力')!.trigger('click')
    expect(wrapper.get('output').text()).toBe('分析双端能力')

    await wrapper.findAll('button').find(button => button.text() === 'Code')!.trigger('click')
    expect(wrapper.get('.agent-component-demo__source').text()).toContain('AgentPromptSuggestions')
    expect(wrapper.get('.agent-component-demo__source').text()).toContain(':suggestions=\"suggestions\"')
  })

  it('renders a neutral approval surface with explicit selected and decision states', async () => {
    const wrapper = mount(AgentComponentDemo, { props: { component: 'approval' } })

    expect(wrapper.findAll('.agent-approval')).toHaveLength(1)
    expect(wrapper.get('.agent-approval__title').text()).toBe('确认发布动作')
    expect(wrapper.findAll('.agent-approval__choice')).toHaveLength(2)
    expect(wrapper.get('.agent-approval__choice[data-selected="true"]').text()).toContain('仅验证')

    const choices = wrapper.findAll('.agent-approval__choice')
    await choices[1]!.get('input').setValue(true)
    expect(wrapper.get('.agent-approval__choice[data-selected="true"]').text()).toContain('验证并发布')

    await wrapper.get('.agent-approval__approve').trigger('click')
    expect(wrapper.get('output').text()).toBe('已批准')
  })

  it('renders multiline Agent content as structure instead of escaped text', () => {
    const markdown = mount(AgentComponentDemo, { props: { component: 'markdown' } })
    expect(markdown.get('.agent-markdown__h').text()).toBe('安全 Markdown')
    expect(markdown.get('table').text()).toContain('Weapp')
    expect(markdown.text()).not.toContain('\\n')

    const stream = mount(AgentComponentDemo, { props: { component: 'stream' } })
    expect(stream.get('.agent-markdown__h').text()).toBe('流式回答')
    expect(stream.text()).not.toContain('\\n')

    const toolResult = mount(AgentComponentDemo, { props: { component: 'tool-result' } })
    expect(toolResult.get('pre').element.textContent).toBe('Test Files 7 passed\nTests 38 passed')
  })

  it('renders designed status visuals for thinking and image generation', () => {
    const thinking = mount(AgentComponentDemo, { props: { component: 'thinking' } })
    expect(thinking.get('.agent-thinking__icon svg').attributes('viewBox')).toBe('0 0 24 24')

    const image = mount(AgentComponentDemo, { props: { component: 'image-generation' } })
    expect(image.get('.agent-image-generation__preview svg').attributes('viewBox')).toBe('0 0 24 24')
    expect(image.get('.agent-image-generation__progress-meta').text()).toContain('68%')
    expect(image.find('.agent-image-generation__placeholder > i').exists()).toBe(false)
  })
})
