// @vitest-environment jsdom

import type { AgentDecision } from './components/agent-ui/agent-decision.types'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import AgentDecisionCard from './components/agent-ui/AgentDecisionCard.vue'
import VButton from './components/ui/v-button.vue'

enableAutoUnmount(afterEach)

const decision: AgentDecision = {
  id: 'format',
  title: '报告使用什么格式？',
  options: [
    { id: 'checklist', label: '核对清单', description: '每项包含核对步骤。', recommended: true },
    { id: 'summary', label: '简短摘要' },
    { id: 'unavailable', label: '完整报告', disabled: true },
  ],
  allowCustom: true,
  status: 'pending',
}

function mountCard() {
  const wrapper = mount(AgentDecisionCard, { props: { decision } })
  return {
    wrapper,
    option: (label: string) => wrapper.get<HTMLButtonElement>(`button[aria-label^="${label}"]`),
    input: () => wrapper.get<HTMLInputElement>('input[aria-label="自定义回答"]'),
    submit: () => wrapper.get<HTMLButtonElement>('button.agent-decision__submit'),
  }
}

describe('native AgentDecisionCard', () => {
  it('emits one option intent only after explicit submission and shows the application’s accepted answer', async () => {
    const { wrapper, option, submit } = mountCard()
    expect(option('核对清单').text()).toContain('推荐')
    expect(option('核对清单').text()).toContain('每项包含核对步骤。')
    expect(option('核对清单').attributes('aria-pressed')).toBe('false')
    expect(option('完整报告').text()).toContain('不可用')
    expect(option('完整报告').element.disabled).toBe(true)
    expect(submit().element.disabled).toBe(true)

    await option('核对清单').trigger('click')
    expect(option('核对清单').attributes('aria-pressed')).toBe('true')
    expect(wrapper.emitted('answer')).toBeUndefined()
    await submit().trigger('click')
    expect(wrapper.emitted('answer')).toEqual([[{ decisionId: 'format', answer: { kind: 'option', optionId: 'checklist' } }]])
    expect(wrapper.text()).not.toContain('已回答')

    await wrapper.setProps({ decision: { ...decision, status: 'answered', answer: { kind: 'option', optionId: 'summary' } } })
    expect(wrapper.get('[role="status"]').text()).toContain('已回答')
    expect(wrapper.get('[role="status"]').text()).toContain('简短摘要')
    expect(wrapper.find('button').exists()).toBe(false)
    await wrapper.setProps({ decision })
    expect(submit().element.disabled).toBe(true)
  })

  it('keeps a custom draft through submission and error, and retries with trimmed text', async () => {
    const { wrapper, option, input, submit } = mountCard()
    await option('核对清单').trigger('click')
    await input().setValue('   ')
    expect(option('核对清单').attributes('aria-pressed')).toBe('false')
    expect(submit().element.disabled).toBe(true)
    await input().setValue('  使用表格  ')
    await option('简短摘要').trigger('click')
    expect(input().element.value).toBe('')
    await input().setValue('  使用表格  ')
    await submit().trigger('click')

    await wrapper.setProps({ decision: { ...decision, status: 'submitting' } })
    expect(option('简短摘要').element.disabled).toBe(true)
    expect(input().element.disabled).toBe(true)
    expect(submit().element.disabled).toBe(true)
    await wrapper.setProps({ decision: { ...decision, status: 'error', error: '请重试' } })
    expect(wrapper.get('[role="alert"]').text()).toBe('请重试')
    expect(input().element.value).toBe('  使用表格  ')
    await submit().trigger('click')
    const answer = { decisionId: 'format', answer: { kind: 'text', text: '使用表格' } }
    expect(wrapper.emitted('answer')).toEqual([[answer], [answer]])

    await wrapper.setProps({ decision: { ...decision, status: 'answered', answer: { kind: 'text', text: '表格与说明' } } })
    expect(wrapper.get('[role="status"]').text()).toContain('表格与说明')
    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('blocks obsolete options, disabled cards, and drafts from a different decision', async () => {
    const { wrapper, option, input, submit } = mountCard()
    const submitButton = wrapper.findAllComponents(VButton).find(button => button.props('className') === 'agent-decision__submit')!
    // Deliver a child click directly to exercise the card's guard, not only the native button's disabled state.
    const originalOption = wrapper.findAllComponents(VButton).find(button => button.props('ariaLabel')?.startsWith('核对清单'))!
    const queuedOption = originalOption.vm.$.vnode.props!.onClick as () => void
    const deliverQueuedSubmit = () => submitButton.vm.$emit('click', undefined)
    await option('核对清单').trigger('click')
    const disabledOptions = decision.options.map(option => option.id === 'checklist' ? { ...option, disabled: true } : option)
    await wrapper.setProps({ decision: { ...decision, options: disabledOptions } })
    expect(submit().element.disabled).toBe(true)
    deliverQueuedSubmit()
    await wrapper.setProps({ decision: { ...decision, options: decision.options.filter(option => option.id !== 'checklist') } })
    expect(submit().element.disabled).toBe(true)
    queuedOption()
    expect(option('简短摘要').attributes('aria-pressed')).toBe('false')
    deliverQueuedSubmit()

    await input().setValue('使用表格')
    await wrapper.setProps({ decision: { ...decision, allowCustom: false } })
    expect(wrapper.find('input').exists()).toBe(false)
    expect(submit().element.disabled).toBe(true)
    deliverQueuedSubmit()
    await wrapper.setProps({ decision, disabled: true })
    expect(input().element.disabled).toBe(true)
    expect(submit().element.disabled).toBe(true)
    deliverQueuedSubmit()
    await wrapper.setProps({ decision: { ...decision, id: 'new-format' }, disabled: false })
    queuedOption()
    expect(option('核对清单').attributes('aria-pressed')).toBe('false')
    expect(input().element.value).toBe('')
    expect(submit().element.disabled).toBe(true)
    deliverQueuedSubmit()
    expect(wrapper.emitted('answer')).toBeUndefined()
  })
})
