// @vitest-environment jsdom
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { computeAccessibleName } from 'dom-accessibility-api'
import { afterEach, describe, expect, it } from 'vitest'
import { AgentCommandSearch, AgentDiffTable, AgentFilterTable, AgentInsightCard, AgentRadioGroup, AgentRecordsTable } from './components/agent-ui/advanced'

enableAutoUnmount(afterEach)

describe('H5 Agent keyboard and reactive state', () => {
  it('moves radio focus and selection past disabled choices with a single tab stop', async () => {
    const wrapper = mount(AgentRadioGroup, { attachTo: document.body, props: { value: 'one', choices: [{ label: 'One', value: 'one' }, { label: 'Disabled', value: 'disabled', disabled: true }, { label: 'Three', value: 'three' }] } })
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios.map(radio => radio.attributes('tabindex'))).toEqual(['0', '-1', '-1'])
    await radios[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(radios[2]!.element)
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual(['three'])
    expect(wrapper.emitted('change')?.at(-1)).toEqual(['three'])
    await wrapper.setProps({ value: 'three' })
    expect(radios.map(radio => radio.attributes('tabindex'))).toEqual(['-1', '-1', '0'])
    await radios[2]!.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(radios[0]!.element)
    await radios[0]!.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(radios[2]!.element)
    await radios[2]!.trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(radios[0]!.element)
    await wrapper.setProps({ choices: [{ label: 'Replacement', value: 'new' }] })
    expect(wrapper.get('[role="radio"]').attributes('tabindex')).toBe('0')
  })

  it.each(['Home', 'End', 'ArrowRight'])('does not emit a value change for an unchanged %s target', async (key) => {
    const wrapper = mount(AgentRadioGroup, {
      attachTo: document.body,
      props: { value: 'one', choices: [{ label: 'One', value: 'one' }, { label: 'Disabled', value: 'disabled', disabled: true }] },
    })
    const radio = wrapper.get('[tabindex="0"]')
    await radio.trigger('keydown', { key })
    expect(document.activeElement).toBe(radio.element)
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('uses the bounded insight index for display and navigation after replacement', async () => {
    const insights = ['First', 'Second', 'Third'].map((description, index) => ({ id: String(index), description }))
    const wrapper = mount(AgentInsightCard, { props: { current: 2, insights } })
    await wrapper.setProps({ insights: insights.slice(0, 2) })
    expect(wrapper.get('.agent-insight-card__count').text()).toBe('2/2')
    expect(wrapper.get('.agent-insight-card__copy').text()).toBe('Second')
    await wrapper.get('[aria-label="Previous insight"]').trigger('click')
    expect(wrapper.emitted('update:current')).toEqual([[0]])
    await wrapper.setProps({ insights: [{ id: 'new', description: 'Replacement' }] })
    expect(wrapper.get('.agent-insight-card__count').text()).toBe('1/1')
    expect(wrapper.get('.agent-insight-card__copy').text()).toBe('Replacement')
    await wrapper.setProps({ current: -1 })
    expect(wrapper.get('.agent-insight-card__count').text()).toBe('1/1')
    await wrapper.setProps({ insights: [] })
    expect(wrapper.get('.agent-insight-card__count').text()).toBe('0/0')
  })

  for (const component of [AgentDiffTable, AgentRecordsTable, AgentFilterTable]) {
    it(`${component.name} exposes a real row action within a table cell`, async () => {
      const row = { id: 'one', name: 'Build' }
      const wrapper = mount(component, { props: { columns: [{ key: 'name', label: 'Name' }], rows: [row] } })
      const button = wrapper.get('tbody tr td button')
      expect(button.attributes('type')).toBe('button')
      expect(button.attributes('tabindex')).not.toBe('-1')
      await button.trigger('click')
      expect(wrapper.emitted('select')).toEqual([[row]])
      const replacement = { id: 'two', name: 'Deploy' }
      await wrapper.setProps({ rows: [replacement] })
      await wrapper.get('tbody tr td button').trigger('click')
      expect(wrapper.emitted('select')?.at(-1)).toEqual([replacement])
    })
  }

  it('keeps a persistent command-search name with an empty placeholder', () => {
    const wrapper = mount(AgentCommandSearch, { props: { placeholder: '', modelValue: 'build' } })
    expect(computeAccessibleName(wrapper.get('input').element)).toBe('Search commands')
  })
})
