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
      await wrapper.get('[data-demo-tab="code"]').trigger('click')
      expect(wrapper.get('.agent-component-demo__source').text(), component).toContain(agentDemoCatalog[component].name)
      expect(wrapper.get('.agent-component-demo__source').text(), component).toContain(agentDemoCatalog[component].importPath)
      wrapper.unmount()
    }
  })

  it('presents every demo in a keyboard-operable workflow shell', async () => {
    const wrapper = mount(AgentComponentDemo, {
      attachTo: document.body,
      props: { component: 'loading' },
    })
    const preview = wrapper.get<HTMLButtonElement>('[data-demo-tab="preview"]')
    const code = wrapper.get<HTMLButtonElement>('[data-demo-tab="code"]')
    const previewPanel = wrapper.get('[role="tabpanel"]')

    expect(wrapper.get('[role="tablist"]').attributes('aria-label')).toBe('交互预览')
    expect(preview.attributes('aria-selected')).toBe('true')
    expect(preview.attributes('aria-controls')).toBe(previewPanel.attributes('id'))
    expect(previewPanel.attributes('aria-labelledby')).toBe(preview.attributes('id'))
    expect(wrapper.get('.agent-component-demo__meta').text()).toContain('H5 与 Wevu 使用同一公共 API')

    preview.element.focus()
    await preview.trigger('keydown', { key: 'ArrowRight' })
    expect(code.attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(code.element)
    expect(wrapper.get('.agent-component-demo__source').attributes('aria-labelledby')).toBe(code.attributes('id'))

    wrapper.unmount()
  })

  it('forwards interactive demo output', async () => {
    const wrapper = mount(AgentComponentDemo, { props: { component: 'prompt-suggestions' } })
    await wrapper.findAll('button').find(button => button.text() === '分析双端能力')!.trigger('click')
    expect(wrapper.get('output').text()).toBe('分析双端能力')

    await wrapper.get('[data-demo-tab="code"]').trigger('click')
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

  it('uses semantic icons and accessible composer controls', () => {
    const composer = mount(AgentComponentDemo, { props: { component: 'composer' } })
    expect(composer.get('textarea').attributes('aria-label')).toBe('Agent 输入')
    expect(composer.get('button[aria-label="发送"] svg').attributes('viewBox')).toBe('0 0 24 24')

    const approval = mount(AgentComponentDemo, { props: { component: 'approval' } })
    expect(approval.get('.agent-approval__icon svg').attributes('viewBox')).toBe('0 0 24 24')

    const toolApproval = mount(AgentComponentDemo, { props: { component: 'tool-approval' } })
    expect(toolApproval.get('.agent-tool-approval > header svg').attributes('viewBox')).toBe('0 0 24 24')
  })
  it('uses visible radio choices instead of a native select menu for fine tuning', async () => {
    const wrapper = mount(AgentComponentDemo, { props: { component: 'fine-tune' } })

    expect(wrapper.find('select').exists()).toBe(false)
    const choices = wrapper.findAll('.agent-fine-tune__choice')
    expect(choices).toHaveLength(2)
    expect(choices[0]!.attributes('data-selected')).toBe('true')
    expect(choices[0]!.get('input').attributes('type')).toBe('radio')
    expect(choices[0]!.get('input').attributes('name')).toBe(choices[1]!.get('input').attributes('name'))

    await choices[1]!.get('input').setValue(true)
    expect(wrapper.get('.agent-fine-tune__choice[data-selected="true"]').text()).toContain('Expressive')
  })
  it('keeps attachment removal a borderless destructive action', async () => {
    const wrapper = mount(AgentComponentDemo, { props: { component: 'attachments' } })
    const remove = wrapper.get('button[aria-label="移除 agent-events.schema.json"]')

    expect(remove.classes()).toContain('agent-action--danger')
    expect(remove.classes()).toContain('border-0')
    expect(remove.classes()).not.toContain('hover:border-red-100')
    await remove.trigger('click')
    expect(wrapper.get('output').text()).toContain('移除 agent-events.schema.json')
  })
})
