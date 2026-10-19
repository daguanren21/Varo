import type { AgentActivityItem } from '../../../apps/playground-weapp/src/components/agent-ui/advanced-types'
import type { AgentTraceStep } from '../../../apps/playground-weapp/src/components/agent-ui/types'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import AgentActivity from '../../../apps/playground-weapp/src/components/agent-ui/AgentActivity.vue'
import AgentThinking from '../../../apps/playground-weapp/src/components/agent-ui/AgentThinking.vue'
import AgentToolResult from '../../../apps/playground-weapp/src/components/agent-ui/AgentToolResult.vue'

enableAutoUnmount(afterEach)

// Untyped native controlled properties initialize omitted values to null.
const nativeUnset = null as unknown as undefined
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
  { name: 'Thinking', trigger: '.agent-thinking__step-trigger', detail: '.agent-thinking__detail', create: (props: RowProps) => mount(AgentThinking, { props: { ...props, steps, open: nativeUnset, defaultOpen: true } }) },
  { name: 'Activity', trigger: '.agent-activity__trigger', detail: '.agent-activity__detail', create: (props: RowProps) => mount(AgentActivity, { props: { ...props, items } }) },
]) {
  describe(`native ${scenario.name} row disclosure`, () => {
    it('keeps details static by default and excludes empty rows from controls', async () => {
      const wrapper = scenario.create({ expandedIds: nativeUnset })
      expect(wrapper.findAll(scenario.detail)).toHaveLength(2)
      expect(wrapper.find(scenario.trigger).exists()).toBe(false)
      await wrapper.setProps({ expandable: true })
      expect(wrapper.findAll(scenario.trigger)).toHaveLength(2)
      expect(wrapper.find(scenario.detail).exists()).toBe(false)
    })

    it('uses null native absence for independent uncontrolled row updates', async () => {
      const wrapper = scenario.create({ expandable: true, expandedIds: nativeUnset, defaultExpandedIds: ['a'] })
      const buttons = wrapper.findAll(scenario.trigger)
      expect(buttons[0]!.attributes('aria-expanded')).toBe('true')
      expect(wrapper.get(scenario.detail).text()).toBe('Reasoning detail')
      await buttons[1]!.trigger('click')
      expect(wrapper.findAll(scenario.detail)).toHaveLength(2)
      expect(wrapper.emitted('update:expandedIds')).toEqual([[['a', 'b']]])
      await buttons[0]!.trigger('click')
      expect(wrapper.get(scenario.detail).text()).toBe('Search detail')
      expect(wrapper.emitted('update:expandedIds')?.[1]).toEqual([['b']])
      expect(wrapper.text()).toContain('进行中')
      expect(wrapper.text()).toContain('失败')
    })

    it('emits intended ids while controlled refusal leaves the rendered state unchanged', async () => {
      const accepted: string[] = []
      Object.freeze(accepted)
      const wrapper = scenario.create({ expandable: true, expandedIds: accepted, defaultExpandedIds: ['a'] })
      await wrapper.get(scenario.trigger).trigger('click')
      expect(wrapper.emitted('update:expandedIds')).toEqual([[['a']]])
      expect(wrapper.find(scenario.detail).exists()).toBe(false)
      expect(accepted).toEqual([])
      await wrapper.setProps({ expandedIds: ['a', 'b'] })
      expect(wrapper.findAll(scenario.detail)).toHaveLength(2)
      await wrapper.get(scenario.trigger).trigger('click')
      expect(wrapper.emitted('update:expandedIds')?.[1]).toEqual([['b']])
      expect(wrapper.findAll(scenario.detail)).toHaveLength(2)
    })
  })
}

describe('native stable row and group identity', () => {
  it('preserves Thinking expansion through reorder/group toggles and prunes removals', async () => {
    const wrapper = mount(AgentThinking, { props: { steps, open: nativeUnset, expandedIds: nativeUnset, defaultOpen: true, expandable: true, defaultExpandedIds: ['a'] } })
    await wrapper.setProps({ steps: [steps[1]!, steps[0]!, steps[2]!] })
    expect(wrapper.findAll('.agent-thinking__step-trigger')[1]!.attributes('aria-expanded')).toBe('true')
    await wrapper.get('.agent-thinking__trigger').trigger('click')
    expect(wrapper.find('.agent-thinking__step-trigger').exists()).toBe(false)
    await wrapper.get('.agent-thinking__trigger').trigger('click')
    expect(wrapper.get('.agent-thinking__detail').text()).toBe('Reasoning detail')
    await wrapper.setProps({ steps: [steps[1]!] })
    await wrapper.setProps({ steps })
    expect(wrapper.find('.agent-thinking__detail').exists()).toBe(false)
    await wrapper.setProps({ expandedIds: ['a'], steps: [steps[1]!] })
    await wrapper.setProps({ steps })
    expect(wrapper.get('.agent-thinking__detail').text()).toBe('Reasoning detail')
    expect(wrapper.emitted('update:expandedIds')).toBeUndefined()
    await wrapper.setProps({ open: false })
    await wrapper.get('.agent-thinking__trigger').trigger('click')
    expect(wrapper.attributes('data-open')).toBe('false')
  })

  it('prunes only uncontrolled Activity ids while controlled ids survive removal', async () => {
    const wrapper = mount(AgentActivity, { props: { items, expandable: true, expandedIds: nativeUnset, defaultExpandedIds: ['a'] } })
    await wrapper.setProps({ items: [items[1]!, items[0]!] })
    expect(wrapper.findAll('.agent-activity__trigger')[1]!.attributes('aria-expanded')).toBe('true')
    await wrapper.setProps({ items: [items[1]!] })
    await wrapper.setProps({ items })
    expect(wrapper.find('.agent-activity__detail').exists()).toBe(false)
    await wrapper.setProps({ expandedIds: ['a'], items: [items[1]!] })
    await wrapper.setProps({ items })
    expect(wrapper.get('.agent-activity__detail').text()).toBe('Reasoning detail')
    expect(wrapper.emitted('update:expandedIds')).toBeUndefined()
  })
})

describe('native ToolResult open ownership', () => {
  it('distinguishes an omitted native open prop from explicit false for completed results', async () => {
    const closed = mount(AgentToolResult, { props: { name: 'lookup', open: nativeUnset } })
    const opened = mount(AgentToolResult, { props: { name: 'lookup', open: nativeUnset, defaultOpen: true } })
    expect(closed.attributes('data-open')).toBe('false')
    expect(opened.attributes('data-open')).toBe('true')
    await closed.get('.agent-tool-result__header').trigger('click')
    await opened.get('.agent-tool-result__header').trigger('click')
    expect(closed.attributes('data-open')).toBe('true')
    expect(opened.attributes('data-open')).toBe('false')
  })

  it('honors explicit false and waits for controlled parent acceptance', async () => {
    const wrapper = mount(AgentToolResult, { props: { name: 'lookup', output: 'Results', status: 'failed', defaultOpen: true, open: false } })
    expect(wrapper.find('.agent-tool-result__body').exists()).toBe(false)
    await wrapper.get('.agent-tool-result__header').trigger('click')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
    expect(wrapper.find('.agent-tool-result__body').exists()).toBe(false)
    await wrapper.setProps({ open: true })
    expect(wrapper.get('.agent-tool-result__body').text()).toBe('Results')
    await wrapper.get('.agent-tool-result__retry').trigger('click')
    expect(wrapper.emitted('retry')).toEqual([[]])
    await wrapper.get('.agent-tool-result__header').trigger('click')
    expect(wrapper.find('.agent-tool-result__body').exists()).toBe(true)
    await wrapper.setProps({ open: false })
    expect(wrapper.find('.agent-tool-result__body').exists()).toBe(false)
  })

  it.each(['running', 'failed'] as const)('initializes absent open from %s without reopening later', async (status) => {
    const wrapper = mount(AgentToolResult, { props: { name: 'lookup', status, open: nativeUnset } })
    expect(wrapper.attributes('data-open')).toBe('true')
    await wrapper.get('.agent-tool-result__header').trigger('click')
    await wrapper.setProps({ status: 'completed' })
    await wrapper.setProps({ status })
    expect(wrapper.attributes('data-open')).toBe('false')
    await wrapper.get('.agent-tool-result__header').trigger('click')
    expect(wrapper.attributes('data-open')).toBe('true')
  })
})
