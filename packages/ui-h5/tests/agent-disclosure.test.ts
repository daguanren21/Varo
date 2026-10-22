import type { AgentActivityItem } from '../../../apps/playground-h5/src/components/agent-ui/advanced-types'
import type { AgentTraceStep } from '../../../apps/playground-h5/src/components/agent-ui/types'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import { AgentActivity, AgentToolResult } from '../../../apps/playground-h5/src/components/agent-ui/advanced'
import { AgentThinking } from '../../../apps/playground-h5/src/components/agent-ui/conversation'

enableAutoUnmount(afterEach)

const steps: AgentTraceStep[] = [
  { id: 'a', title: 'Analyze', status: 'running', content: 'Reasoning detail' },
  { id: 'b', title: 'Search', status: 'failed', detail: 'Search detail' },
  { id: 'static', title: 'No detail', status: 'waiting' },
]
const items: AgentActivityItem[] = steps.map(step => ({ ...step, detail: step.detail ?? step.content, kind: 'reasoning' }))

interface RowProps {
  expandable?: boolean
  expandedIds?: string[]
  defaultExpandedIds?: string[]
}

for (const scenario of [
  { name: 'Thinking', trigger: '.agent-thinking__step-trigger', create: (props: RowProps) => mount(AgentThinking, { props: { ...props, steps, defaultOpen: true } }) },
  { name: 'Activity', trigger: '.agent-activity__trigger', create: (props: RowProps) => mount(AgentActivity, { props: { ...props, items } }) },
]) {
  describe(`H5 ${scenario.name} row disclosure`, () => {
    it('preserves static detail until expansion is explicitly enabled', async () => {
      const wrapper = scenario.create({})
      expect(wrapper.find(scenario.trigger).exists()).toBe(false)
      expect(wrapper.text()).toContain('Reasoning detail')
      expect(wrapper.text()).toContain('Search detail')
      await wrapper.setProps({ expandable: true })
      expect(wrapper.findAll(scenario.trigger)).toHaveLength(2)
      expect(wrapper.findAll('[hidden]')).toHaveLength(2)
      expect(wrapper.text()).toContain('进行中')
      expect(wrapper.text()).toContain('失败')
    })

    it('opens two rows independently and connects semantic controls to unique details', async () => {
      const wrapper = scenario.create({ expandable: true })
      const buttons = wrapper.findAll(scenario.trigger)
      const first = buttons[0]!
      const second = buttons[1]!
      expect(first.element.tagName).toBe('BUTTON')
      expect(first.attributes('type')).toBe('button')
      const detailId = first.attributes('aria-controls')
      expect(detailId).toBeTruthy()
      expect(second.attributes('aria-controls')).not.toBe(detailId)
      const detail = wrapper.findAll('[id]').find(node => node.attributes('id') === detailId)!
      expect(detail.attributes('hidden')).toBeDefined()
      await first.trigger('click')
      expect(first.attributes('aria-expanded')).toBe('true')
      expect(detail.attributes('hidden')).toBeUndefined()
      await second.trigger('click')
      expect(first.attributes('aria-expanded')).toBe('true')
      expect(second.attributes('aria-expanded')).toBe('true')
      expect(wrapper.emitted('update:expandedIds')).toEqual([[['a']], [['a', 'b']]])
      await first.trigger('click')
      expect(second.attributes('aria-expanded')).toBe('true')
      expect(wrapper.emitted('update:expandedIds')?.[2]).toEqual([['b']])
    })

    it('keeps controlled arrays parent-owned through rejection and acceptance', async () => {
      const accepted: string[] = ['a']
      Object.freeze(accepted)
      const wrapper = scenario.create({ expandable: true, expandedIds: accepted, defaultExpandedIds: ['b'] })
      const buttons = wrapper.findAll(scenario.trigger)
      await buttons[1]!.trigger('click')
      expect(wrapper.emitted('update:expandedIds')).toEqual([[['a', 'b']]])
      expect(buttons[1]!.attributes('aria-expanded')).toBe('false')
      expect(accepted).toEqual(['a'])
      await wrapper.setProps({ expandedIds: ['a', 'b'] })
      expect(buttons[1]!.attributes('aria-expanded')).toBe('true')
      await wrapper.setProps({ expandedIds: [] })
      await buttons[0]!.trigger('click')
      expect(buttons[0]!.attributes('aria-expanded')).toBe('false')
      expect(wrapper.emitted('update:expandedIds')?.[1]).toEqual([['a']])
    })
  })
}

describe('H5 stable disclosure identity', () => {
  it('assigns distinct control targets to component instances in the same application', () => {
    const wrapper = mount({
      render: () => h('div', [
        h(AgentThinking, { steps, expandable: true, defaultOpen: true }),
        h(AgentThinking, { steps, expandable: true, defaultOpen: true }),
        h(AgentActivity, { items, expandable: true }),
        h(AgentActivity, { items, expandable: true }),
      ]),
    })
    const controls = wrapper.findAll('[aria-controls]').map(node => node.attributes('aria-controls'))
    expect(new Set(controls).size).toBe(8)
    for (const id of controls) {
      expect(wrapper.findAll('[id]').filter(node => node.attributes('id') === id)).toHaveLength(1)
    }
  })

  it('preserves Thinking group control and prunes removed uncontrolled ids', async () => {
    const wrapper = mount(AgentThinking, { props: { steps, defaultOpen: true, expandable: true, defaultExpandedIds: ['a'] } })
    await wrapper.setProps({ steps: [steps[1]!, steps[0]!, steps[2]!] })
    expect(wrapper.findAll('.agent-thinking__step-trigger')[1]!.attributes('aria-expanded')).toBe('true')
    await wrapper.get('.agent-thinking__trigger').trigger('click')
    expect(wrapper.find('.agent-thinking__step-trigger').exists()).toBe(false)
    await wrapper.get('.agent-thinking__trigger').trigger('click')
    expect(wrapper.findAll('.agent-thinking__step-trigger')[1]!.attributes('aria-expanded')).toBe('true')
    await wrapper.setProps({ steps: [steps[1]!] })
    await wrapper.setProps({ steps })
    expect(wrapper.get('.agent-thinking__step-trigger').attributes('aria-expanded')).toBe('false')
    await wrapper.setProps({ expandedIds: ['a'], steps: [steps[1]!] })
    await wrapper.setProps({ steps })
    expect(wrapper.get('.agent-thinking__step-trigger').attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:expandedIds')).toBeUndefined()
    await wrapper.setProps({ open: false })
    await wrapper.get('.agent-thinking__trigger').trigger('click')
    expect(wrapper.attributes('data-open')).toBe('false')
  })

  it('preserves Activity row identity on reorder and prunes only internal ids on removal', async () => {
    const wrapper = mount(AgentActivity, { props: { items, expandable: true, defaultExpandedIds: ['a'] } })
    await wrapper.setProps({ items: [items[1]!, items[0]!, items[2]!] })
    expect(wrapper.findAll('.agent-activity__trigger')[1]!.attributes('aria-expanded')).toBe('true')
    await wrapper.setProps({ items: [items[1]!] })
    await wrapper.setProps({ items })
    expect(wrapper.get('.agent-activity__trigger').attributes('aria-expanded')).toBe('false')
    await wrapper.setProps({ expandedIds: ['a'], items: [items[1]!] })
    await wrapper.setProps({ items })
    expect(wrapper.get('.agent-activity__trigger').attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:expandedIds')).toBeUndefined()
  })
})

describe('H5 ToolResult open ownership', () => {
  it('toggles completed results from the configured uncontrolled default', async () => {
    const closed = mount(AgentToolResult, { props: { name: 'lookup' } })
    const opened = mount(AgentToolResult, { props: { name: 'lookup', defaultOpen: true } })
    expect(closed.attributes('data-open')).toBe('false')
    expect(opened.attributes('data-open')).toBe('true')
    await closed.get('.agent-tool-result__header').trigger('click')
    await opened.get('.agent-tool-result__header').trigger('click')
    expect(closed.attributes('data-open')).toBe('true')
    expect(opened.attributes('data-open')).toBe('false')
  })

  it('keeps controlled false closed until the parent accepts an update', async () => {
    const wrapper = mount(AgentToolResult, { props: { name: 'lookup', status: 'running', open: false, defaultOpen: true, output: 'Results' } })
    const trigger = wrapper.get('.agent-tool-result__header')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await wrapper.setProps({ open: true })
    expect(wrapper.get('.agent-tool-result__body').text()).toBe('Results')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    await wrapper.setProps({ open: false, status: 'failed' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.agent-tool-result__retry').exists()).toBe(false)
  })

  it.each(['running', 'failed'] as const)('uses %s only as an initial open policy', async (status) => {
    const wrapper = mount(AgentToolResult, { props: { name: 'lookup', status } })
    const trigger = wrapper.get('.agent-tool-result__header')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    await trigger.trigger('click')
    await wrapper.setProps({ status: 'completed' })
    await wrapper.setProps({ status })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
  })
})
