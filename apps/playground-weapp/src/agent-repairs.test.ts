// @vitest-environment jsdom
import type { Component } from 'vue'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import AgentApproval from './components/agent-ui/AgentApproval.vue'
import AgentCommandSearch from './components/agent-ui/AgentCommandSearch.vue'
import AgentDiffTable from './components/agent-ui/AgentDiffTable.vue'
import AgentFileDiff from './components/agent-ui/AgentFileDiff.vue'
import AgentFilterTable from './components/agent-ui/AgentFilterTable.vue'
import AgentInsightCard from './components/agent-ui/AgentInsightCard.vue'
import AgentRecordsTable from './components/agent-ui/AgentRecordsTable.vue'

const { createWevuComponentDefinition } = createRequire(import.meta.url)(fileURLToPath(import.meta.resolve('wevu/internal-runtime')))

enableAutoUnmount(afterEach)

// Exercise Wevu's actual metadata conversion, including native property overrides.
function nativeProps(component: Component, supplied: Record<string, unknown> = {}) {
  const metadata = component as Component & { props?: unknown, properties?: unknown }
  const normalized = createWevuComponentDefinition({ ...metadata, allowNullPropInput: true }).__wevu_options.mpOptions
  const initial: Record<string, unknown> = {}
  for (const [name, definition] of Object.entries(normalized.properties ?? {})) {
    const property = definition as { type?: unknown, value?: unknown }
    if ('value' in property) { initial[name] = property.value }
    else if (property.type === String) { initial[name] = '' }
    else if (property.type === Number) { initial[name] = 0 }
    else if (property.type === Boolean) { initial[name] = false }
    else if (property.type === Array) { initial[name] = [] }
    else { initial[name] = null }
  }
  return { ...initial, ...supplied }
}

function nativeMount(component: Component, supplied: Record<string, unknown> = {}) {
  return mount(component, { props: nativeProps(component, supplied) })
}

describe('Agent state and accessible actions', () => {
  it('confirms no-choice approval with a real empty-value event', async () => {
    const wrapper = nativeMount(AgentApproval, { title: 'Proceed' })
    await wrapper.get('.agent-approval__approve').trigger('click')
    expect(wrapper.emitted('approve')).toEqual([['']])
    await wrapper.setProps({ choices: [{ label: 'Allow', value: 'allow' }] })
    await wrapper.get('.agent-approval__approve').trigger('click')
    expect(wrapper.emitted('approve')).toHaveLength(1)
  })

  it('distinguishes native absence, default selection and explicit controlled empty value', async () => {
    const choices = [{ label: 'Allow', value: 'allow' }, { label: 'Review', value: 'review' }]
    const controlled = nativeMount(AgentApproval, { title: 'Proceed', choices, value: '', defaultValue: 'allow' })
    expect(controlled.findAll('[role="radio"]').every(item => item.attributes('aria-checked') === 'false')).toBe(true)
    const wrapper = nativeMount(AgentApproval, { title: 'Proceed', choices, defaultValue: 'allow' })
    expect(wrapper.findAll('[role="radio"]')[0]!.attributes('aria-checked')).toBe('true')
    await wrapper.findAll('[role="radio"]')[1]!.trigger('click')
    expect(wrapper.findAll('[role="radio"]')[1]!.attributes('aria-checked')).toBe('true')
    await wrapper.setProps({ value: '' })
    await wrapper.findAll('[role="radio"]')[0]!.trigger('click')
    expect(wrapper.findAll('[role="radio"]').every(item => item.attributes('aria-checked') === 'false')).toBe(true)
    await wrapper.setProps({ value: 'allow' })
    await wrapper.get('.agent-approval__approve').trigger('click')
    expect(wrapper.emitted('approve')).toEqual([['allow']])
  })

  it('derives absent diff counts while respecting explicit zero overrides and replacement lines', async () => {
    const zero = nativeMount(AgentFileDiff, { filename: 'zero.ts', additions: 0, deletions: 0, lines: [{ type: 'add', content: 'a' }, { type: 'remove', content: 'b' }] })
    expect(zero.get('[data-kind="addition"]').text()).toBe('+0')
    expect(zero.get('[data-kind="deletion"]').text()).toBe('−0')
    const wrapper = nativeMount(AgentFileDiff, { filename: 'a.ts', lines: [{ type: 'add', content: 'a' }, { type: 'remove', content: 'b' }] })
    expect(wrapper.get('[data-kind="addition"]').text()).toBe('+1')
    expect(wrapper.get('[data-kind="deletion"]').text()).toBe('−1')
    await wrapper.setProps({ additions: 0, deletions: 0 })
    expect(wrapper.get('[data-kind="addition"]').text()).toBe('+0')
    expect(wrapper.get('[data-kind="deletion"]').text()).toBe('−0')
    await wrapper.setProps(nativeProps(AgentFileDiff, { filename: 'a.ts', lines: [{ type: 'add', content: 'replacement' }, { type: 'add', content: 'second' }] }))
    expect(wrapper.get('[data-kind="addition"]').text()).toBe('+2')
    expect(wrapper.get('[data-kind="deletion"]').text()).toBe('−0')
  })

  it('uses one bounded insight index after shrinking and replacing arrays', async () => {
    const insights = ['First', 'Second', 'Third'].map((description, index) => ({ id: String(index), description }))
    const wrapper = mount(AgentInsightCard, { props: { current: 2, insights } })
    await wrapper.setProps({ insights: insights.slice(0, 2) })
    expect(wrapper.get('.agent-insight-card__count').text()).toBe('2/2')
    expect(wrapper.get('.agent-insight-card__copy').text()).toBe('Second')
    await wrapper.get('[aria-label="Previous insight"]').trigger('click')
    expect(wrapper.emitted('update:current')?.at(-1)).toEqual([0])
    await wrapper.setProps({ insights: [{ id: 'new', description: 'Replacement' }] })
    expect(wrapper.get('.agent-insight-card__count').text()).toBe('1/1')
    expect(wrapper.get('.agent-insight-card__copy').text()).toBe('Replacement')
    await wrapper.setProps({ insights: [] })
    expect(wrapper.get('.agent-insight-card__count').text()).toBe('0/0')
  })

  for (const component of [AgentDiffTable, AgentRecordsTable, AgentFilterTable]) {
    it(`${component.__name} keeps row and action semantics separate`, async () => {
      const row = { id: 'one', name: 'Build' }
      const wrapper = mount(component, { props: { columns: [{ key: 'name', label: 'Name' }], rows: [row] } })
      const button = wrapper.get('[role="row"] [role="cell"] button')
      expect(button.attributes('role')).not.toBe('row')
      await button.trigger('click')
      expect(wrapper.emitted('select')).toEqual([[row]])
    })
  }

  it('names command search independently of placeholder and value', async () => {
    const wrapper = mount(AgentCommandSearch, { props: { placeholder: '', modelValue: 'build' } })
    expect(wrapper.get('input').attributes('aria-label')).toBe('Search commands')
  })
})
