import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AgentComponentDemo from './AgentComponentDemo.vue'
import { agentDemoCatalog } from '../agent-component-catalog'
import { AgentThinking } from './agent-ui'

const components = [
  'loading', 'thinking', 'markdown', 'stream', 'message', 'conversation',
  'tool-chip', 'task-list', 'radio-group', 'approval', 'recommendation',
  'prompt-suggestions', 'composer', 'response-actions', 'artifact', 'sources',
  'attachments', 'event-renderer', 'message-scroller', 'code-block', 'file-diff',
  'tool-result', 'image-generation', 'tool-approval', 'citations', 'activity',
  'sidebar', 'context-card', 'insight-card', 'selection-actions', 'diff-table',
  'records-table', 'filter-table', 'command-search', 'flowchart', 'fine-tune',
  'agent-chat'
]

describe('AgentComponentDemo', () => {
  it('renders a real demo for every documented Agent surface', async () => {
    for (const component of components) {
      const wrapper = mount(AgentComponentDemo, { props: { component } })
      expect(wrapper.attributes('data-demo')).toBe(component)
      expect(wrapper.get('.agent-component-demo__stage').text().trim().length, component).toBeGreaterThan(0)
      await wrapper.get('.demo-code-panel__toggle').trigger('click')
      expect(wrapper.get('.demo-code-panel__body').text(), component).toContain(agentDemoCatalog[component].name)
      expect(wrapper.get('.demo-code-panel__body').text(), component).toContain(agentDemoCatalog[component].importPath)
      wrapper.unmount()
    }
  })

  it('forwards interactive demo output', async () => {
    const wrapper = mount(AgentComponentDemo, { props: { component: 'prompt-suggestions' } })
    await wrapper.findAll('button').find((button) => button.text() === '分析双端能力')!.trigger('click')
    expect(wrapper.get('output').text()).toBe('分析双端能力')


    await wrapper.get('.demo-code-panel__toggle').trigger('click')
    expect(wrapper.get('.demo-code-panel__body').text()).toContain('AgentPromptSuggestions')
    expect(wrapper.get('.demo-code-panel__body').text()).toContain(':suggestions="suggestions"')
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

  it('follows streaming state until the user manually takes control', async () => {
    const steps = [
      { id: 'inspect', status: 'running' as const, title: 'Inspect' },
    ]
    const wrapper = mount(AgentThinking, {
      props: {
        steps,
        streaming: true,
      },
    })

    expect(wrapper.attributes('data-open')).toBe('true')
    await wrapper.setProps({ streaming: false })
    expect(wrapper.attributes('data-open')).toBe('false')

    await wrapper.get('.agent-thinking__trigger').trigger('click')
    expect(wrapper.attributes('data-open')).toBe('true')
    await wrapper.setProps({ streaming: true })
    await wrapper.setProps({ streaming: false })
    expect(wrapper.attributes('data-open')).toBe('true')
  })
})
