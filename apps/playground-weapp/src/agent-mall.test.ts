// @vitest-environment jsdom

import type { MallAgentController } from './features/mall/useMallAgent'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import AgentApproval from './components/agent-ui/AgentApproval.vue'
import AgentComposer from './components/agent-ui/AgentComposer.vue'
import AgentMarkdown from './components/agent-ui/AgentMarkdown.vue'
import AgentRadioGroup from './components/agent-ui/AgentRadioGroup.vue'
import { useMallAgent } from './features/mall/useMallAgent'

function mountAgentHarness() {
  let agent!: MallAgentController
  const wrapper = mount(
    defineComponent({
      setup() {
        agent = useMallAgent()
        return () => h('div')
      },
    }),
  )
  return { agent, wrapper }
}

async function finishTimers(promise: Promise<unknown>) {
  await vi.runAllTimersAsync()
  await promise
}

describe('Varo Agent UI contracts', () => {
  it('moves one shared radio indicator through controlled choices', async () => {
    const wrapper = mount(AgentRadioGroup, {
      props: {
        choices: [
          { label: '一件', value: '1' },
          { label: '两件', value: '2' },
        ],
        value: '1',
      },
    })

    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('update:value')?.[0]).toEqual(['2'])
    expect(wrapper.findAll('[role="radio"]')[0].attributes('aria-checked')).toBe('true')
  })

  it('keeps approval and composer actions explicit', async () => {
    const approval = mount(AgentApproval, {
      props: {
        title: '确认购买',
        choices: [{ label: '一件', value: '1' }],
        value: '1',
      },
    })
    await approval.findAll('.varo-button').at(-1)!.trigger('click')
    expect(approval.get('.agent-approval__icon image').attributes('src')).toContain('data:image/svg+xml')
    expect(approval.emitted('approve')?.[0]).toEqual(['1'])

    const composer = mount(AgentComposer, { props: { modelValue: '买一盒牛奶' } })
    await composer.get('button[aria-label="发送消息"]').trigger('click')
    expect(composer.get('button[aria-label="发送消息"] image').attributes('src')).toContain('data:image/svg+xml')
    expect(composer.emitted('submit')?.[0]).toEqual(['买一盒牛奶'])
  })

  it('uses rich-text only for safe inline Markdown and preserves link events', async () => {
    const inline = mount(AgentMarkdown, {
      props: {
        content: '**Ready** and `safe`',
        final: true,
      },
    })
    await inline.vm.$nextTick()
    expect(inline.find('rich-text').exists()).toBe(true)

    const link = mount(AgentMarkdown, {
      props: {
        content: '[Docs](https://example.com)',
        final: true,
      },
    })
    await link.vm.$nextTick()
    expect(link.find('rich-text').exists()).toBe(false)
    await link.get('[role="link"]').trigger('click')
    expect(link.emitted('link')?.[0]).toEqual(['https://example.com'])
  })
})

describe('AI-driven mall flows', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('streams a purchase plan and only creates an order after approval', async () => {
    const { agent, wrapper } = mountAgentHarness()
    const stockBefore = agent.products.value.find(product => product.id === 'milk')!.stock

    const sendPromise = agent.send('买 2 盒牛奶')
    await vi.advanceTimersByTimeAsync(600)
    expect(agent.streamSnapshot.value).toMatchObject({
      status: 'streaming',
      message: { role: 'assistant' },
    })
    expect(agent.streamSnapshot.value.message?.source.length).toBeGreaterThan(0)
    await finishTimers(sendPromise)
    expect(agent.pendingAction.value).toMatchObject({ type: 'purchase', product: { id: 'milk' } })
    expect(agent.orders.value).toHaveLength(1)

    await finishTimers(agent.approve('2'))
    expect(agent.orders.value).toHaveLength(2)
    expect(agent.orders.value[0]).toMatchObject({ productId: 'milk', quantity: 2, status: 'paid' })
    expect(agent.products.value.find(product => product.id === 'milk')!.stock).toBe(stockBefore - 2)
    expect(agent.history.value[0].title).toBe('AI 下单成功')
    wrapper.unmount()
  })

  it('supports return, history, and address configuration intents', async () => {
    const { agent, wrapper } = mountAgentHarness()

    await finishTimers(agent.send('我要退货'))
    expect(agent.pendingAction.value).toMatchObject({ type: 'return' })
    await finishTimers(agent.approve('quality'))
    expect(agent.orders.value.find(order => order.id === 'JD20260819001')?.status).toBe('returned')
    expect(agent.history.value[0].type).toBe('return')

    await finishTimers(agent.send('查看订单历史'))
    expect(agent.historyOpen.value).toBe(true)

    await finishTimers(agent.send('修改收货地址'))
    expect(agent.addressEditorOpen.value).toBe(true)
    await finishTimers(
      agent.saveAddress({
        detail: '北京市朝阳区建国路 88 号',
        isDefault: true,
        name: '京小东',
        phone: '13900139000',
      }),
    )
    expect(agent.defaultAddress.value?.detail).toContain('北京市朝阳区')
    expect(agent.history.value[0].type).toBe('address')
    wrapper.unmount()
  })
})
