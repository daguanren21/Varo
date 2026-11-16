// @vitest-environment jsdom

import type { MallAgentController } from './features/mall/useMallAgent'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import AgentApproval from './components/agent-ui/AgentApproval.vue'
import AgentComposer from './components/agent-ui/AgentComposer.vue'
import AgentMarkdown from './components/agent-ui/AgentMarkdown.vue'
import AgentRadioGroup from './components/agent-ui/AgentRadioGroup.vue'
import { agentCurrentMessage, agentMessageText, agentSnapshotProjection } from './components/agent-ui/presentation'
import { useMallAgent } from './features/mall/useMallAgent'
import MallAgentPanel from './components/mall/MallAgentPanel.vue'

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
    expect(approval.emitted('approve')?.[0]).toEqual(['1'])

    const composer = mount(AgentComposer, { props: { modelValue: '买一盒牛奶' } })
    await composer.get('button[aria-label="发送消息"]').trigger('click')
    expect(composer.emitted('submit')?.[0]).toEqual(['买一盒牛奶'])
  })

  it('guards disabled composer confirmation and suggestions until enabled', async () => {
    const composer = mount(AgentComposer, {
      props: {
        disabled: true,
        modelValue: '  查看订单  ',
        suggestions: ['推荐商品'],
      },
    })
    const input = composer.get('textarea')
    const send = composer.get('button[aria-label="发送消息"]')
    const suggestion = composer.findAll('button').find(button => button.text() === '推荐商品')!

    expect(input.attributes('disabled')).toBeDefined()
    expect(send.attributes('disabled')).toBeDefined()
    expect(suggestion.attributes('disabled')).toBeDefined()
    await input.trigger('confirm')
    await suggestion.trigger('click')
    expect(composer.emitted('submit')).toBeUndefined()

    await composer.setProps({ disabled: false })
    expect(send.attributes('disabled')).toBeUndefined()
    await input.trigger('confirm')
    expect(composer.emitted('submit')).toEqual([['查看订单']])
    composer.unmount()
  })

  it('blocks native confirmation and suggestions until pending receipts are accepted', async () => {
    const composer = mount(AgentComposer, {
      props: { modelValue: '草稿', submitDisabled: true, suggestions: ['推荐商品'] },
    })
    try {
      const input = composer.get('textarea')
      const suggestion = composer.findAll('button').find(button => button.text() === '推荐商品')!
      expect(input.attributes('disabled')).toBeUndefined()
      expect(composer.get('button[aria-label="发送消息"]').attributes('disabled')).toBeDefined()
      expect(suggestion.attributes('disabled')).toBeDefined()
      await input.trigger('confirm')
      await suggestion.trigger('click')
      expect(composer.emitted('submit')).toBeUndefined()
      await composer.setProps({ submitDisabled: false })
      await input.trigger('confirm')
      expect(composer.emitted('submit')).toEqual([['草稿']])
    }
    finally { composer.unmount() }
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

  it('preserves distinct Markdown blocks while streaming and replaces their identities with new content', async () => {
    const content = '[Same](https://example.com)\n\n[Same](https://example.com)'
    const wrapper = mount(AgentMarkdown, { props: { content } })
    try {
      const originalLinks = wrapper.findAll('[role="link"]').map(link => link.element)
      expect(originalLinks).toHaveLength(2)
      expect(originalLinks[0]).not.toBe(originalLinks[1])

      await wrapper.setProps({ content: `${content} more\n\n[Same](https://example.com)` })
      const streamedLinks = wrapper.findAll('[role="link"]')
      expect(streamedLinks).toHaveLength(3)
      expect(streamedLinks[0].element).toBe(originalLinks[0])
      expect(streamedLinks[1].element).toBe(originalLinks[1])
      expect(streamedLinks[2].element).not.toBe(originalLinks[1])
      expect(wrapper.text()).toContain('more')

      await wrapper.setProps({ final: true })
      expect(wrapper.findAll('[role="link"]')[1].element).toBe(originalLinks[1])

      await wrapper.setProps({ content: '[Replacement](https://replacement.example)' })
      const replacementLinks = wrapper.findAll('[role="link"]')
      expect(replacementLinks).toHaveLength(1)
      expect(replacementLinks[0].text()).toBe('Replacement')
      expect(replacementLinks[0].element).not.toBe(originalLinks[0])
      await replacementLinks[0].trigger('click')
      expect(wrapper.emitted('link')).toEqual([['https://replacement.example']])

      await wrapper.setProps({ content: '' })
      expect(wrapper.findAll('[role="link"]')).toHaveLength(0)
    }
    finally { wrapper.unmount() }
  })

  it.each([
    {
      name: 'nested lists',
      content: '1. [Same](https://example.com)\n2. [Same](https://example.com)\n   - [Same](https://nested.example)\n   - [Same](https://nested.example)',
      suffix: ' more\n3. [Last](https://last.example)',
      replacement: '4. [New](https://new.example)\n   - [Nested](https://new-nested.example)',
    },
    {
      name: 'table rows and cells',
      content: '| One | Two |\n| --- | --- |\n| [Same](https://example.com) | [Same](https://example.com) |\n| [Same](https://nested.example) | [Same](https://nested.example) |',
      suffix: '\n| [Last](https://last.example) | End |',
      replacement: '| New | Nested |\n| --- | --- |\n| [New](https://new.example) | [Nested](https://new-nested.example) |',
    },
  ])('preserves recursive identities and link events in $name', async ({ content, suffix, replacement }) => {
    const wrapper = mount(AgentMarkdown, { props: { content } })
    try {
      const originalLinks = wrapper.findAll('[role="link"]').map(link => link.element)
      expect(originalLinks).toHaveLength(4)
      expect(new Set(originalLinks).size).toBe(4)

      await wrapper.setProps({ content: content + suffix })
      const streamedLinks = wrapper.findAll('[role="link"]')
      expect(streamedLinks).toHaveLength(5)
      originalLinks.forEach((element, index) => expect(streamedLinks[index].element).toBe(element))
      await streamedLinks[3].trigger('click')
      expect(wrapper.emitted('link')).toEqual([['https://nested.example']])

      await wrapper.setProps({ content: replacement, final: true })
      const replacementLinks = wrapper.findAll('[role="link"]')
      expect(replacementLinks.map(link => link.text())).toEqual(['New', 'Nested'])
      expect(replacementLinks.every(link => !originalLinks.includes(link.element))).toBe(true)
      await replacementLinks[1].trigger('click')
      expect(wrapper.emitted('link')?.at(-1)).toEqual(['https://new-nested.example'])
    }
    finally { wrapper.unmount() }
  })
})

describe('AI-driven mall flows', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('streams a purchase plan and only creates an order after approval', async () => {
    const { agent, wrapper } = mountAgentHarness()
    const stockBefore = agent.products.value.find(product => product.id === 'milk')!.stock

    const sendPromise = agent.send('买 2 盒牛奶')
    for (let elapsed = 0; elapsed < 1000; elapsed += 10) {
      await vi.advanceTimersByTimeAsync(10)
      if (agentMessageText(agentCurrentMessage(agent.streamSnapshot.value))) { break }
    }
    expect(agent.streamSnapshot.value.status).toBe('streaming')
    expect(agentCurrentMessage(agent.streamSnapshot.value)?.role).toBe('assistant')
    expect(agentMessageText(agentCurrentMessage(agent.streamSnapshot.value))).not.toBe('')
    await finishTimers(sendPromise)
    expect(agent.pendingAction.value).toMatchObject({ type: 'purchase', product: { id: 'milk' } })
    expect(agent.orders.value).toHaveLength(1)
    expect(agentSnapshotProjection(agent.streamSnapshot.value).tools.some(tool => tool.status === 'waiting')).toBe(true)

    agent.approvalValue.value = '2'
    const approval = agentSnapshotProjection(agent.streamSnapshot.value).approvals[0]
    expect(approval).toBeDefined()
    await finishTimers(agent.approve(approval!.id))
    expect(agent.orders.value).toHaveLength(2)
    expect(agent.orders.value[0]).toMatchObject({ productId: 'milk', quantity: 2, status: 'paid' })
    expect(agent.products.value.find(product => product.id === 'milk')!.stock).toBe(stockBefore - 2)
    expect(agent.history.value[0]).toMatchObject({ type: 'order', detail: expect.stringContaining('× 2') })
    wrapper.unmount()
  })

  it('cancels a validation-error transaction through the SDK without executing the action', async () => {
    const { agent, wrapper } = mountAgentHarness()
    try {
      await finishTimers(agent.send('买 1 盒牛奶'))
      const approval = agent.streamSnapshot.value.interruptState.interrupts[0]!
      agent.approvalValue.value = 'not-a-number'
      await finishTimers(agent.approve(approval.id))
      expect(agent.streamSnapshot.value.interruptState.interrupts[0]?.status).toBe('error')
      agent.cancelInterrupts()
      await vi.runAllTimersAsync()
      expect(agent.orders.value).toHaveLength(1)
      expect(agent.pendingAction.value).toBeUndefined()
      expect(agent.streamSnapshot.value.interruptState.interrupts).toHaveLength(0)
      if (approval.kind !== 'tool-approval') { throw new Error('Expected bound approval') }
      const result = agent.streamSnapshot.value.messages.flatMap(message => message.parts).filter(part => part.type === 'tool-result').find(part => part.toolCallId === approval.toolCallId)
      expect(result).toMatchObject({ state: 'error', outcome: 'cancelled' })
      await finishTimers(agent.send('查看订单历史'))
      expect(agent.historyOpen.value).toBe(true)
    }
    finally { wrapper.unmount() }
  })

  it('executes and records validated edited inputs, ignoring subsequent UI preview changes', async () => {
    const { agent, wrapper } = mountAgentHarness()
    try {
      await finishTimers(agent.send('买 1 盒牛奶'))
      const approval = agent.streamSnapshot.value.interruptState.interrupts[0]!
      expect(approval.kind).toBe('tool-approval')
      if (approval.kind !== 'tool-approval') { throw new Error('Expected bound approval') }
      expect(approval.id).not.toBe(approval.toolCallId)
      expect(approval.originalArgs).toEqual({ type: 'purchase', productId: 'milk', quantity: 1 })
      if (agent.pendingAction.value?.type !== 'purchase') { throw new Error('Expected purchase preview') }
      agent.pendingAction.value.product.price = 1
      agent.pendingAction.value.product.stock = 0
      agent.pendingAction.value.quantity = 9
      agent.approvalValue.value = '2'
      const decision = agent.approve(approval.id)
      agent.approvalValue.value = '9'
      agent.pendingAction.value = { type: 'purchase', product: agent.products.value[0]!, quantity: 9 }
      await finishTimers(decision)
      expect(agent.orders.value[0]).toMatchObject({ productId: 'milk', quantity: 2, total: 11980 })
      const call = agent.streamSnapshot.value.messages.flatMap(message => message.parts).filter(part => part.type === 'tool-call').find(part => part.id === approval.toolCallId)!
      expect(JSON.parse(call.arguments)).toEqual({ type: 'purchase', productId: 'milk', quantity: 2 })
      expect(call.input).toEqual({ type: 'purchase', productId: 'milk', quantity: 2 })
      expect(call.state).toBe('complete')
      const result = agent.streamSnapshot.value.messages.flatMap(message => message.parts).filter(part => part.type === 'tool-result').find(part => part.toolCallId === approval.toolCallId)
      expect(result?.state).toBe('complete')
      expect(agent.messages.value.some(message => message.parts.some(part => part.type === 'tool-call' && part.id === approval.toolCallId))).toBe(true)
      const panel = mount(MallAgentPanel, { props: { open: true, messages: agent.messages.value, streamSnapshot: agent.streamSnapshot.value } })
      try { expect(panel.text()).toContain('local.mall.execute') }
      finally { panel.unmount() }
    }
    finally { wrapper.unmount() }
  })

  it('keeps schema errors visible without side effects and accepts corrected approval input', async () => {
    const { agent, wrapper } = mountAgentHarness()
    try {
      await finishTimers(agent.send('买 1 盒牛奶'))
      const approval = agent.streamSnapshot.value.interruptState.interrupts[0]!
      const stock = agent.products.value.find(product => product.id === 'milk')!.stock
      agent.approvalValue.value = '0'
      await finishTimers(agent.approve(approval.id))
      expect(agent.orders.value).toHaveLength(1)
      expect(agent.products.value.find(product => product.id === 'milk')!.stock).toBe(stock)
      const failed = agent.streamSnapshot.value.interruptState.interrupts[0]!
      expect(failed.status).toBe('error')
      expect(failed.errors[0]?.code).toBe('invalid-edited-args')
      expect(agentSnapshotProjection(agent.streamSnapshot.value).approvals[0]?.canResolve).toBe(true)
      const panel = mount(MallAgentPanel, { props: { open: true, messages: agent.messages.value, streamSnapshot: agent.streamSnapshot.value } })
      try { expect(panel.text()).toContain(failed.errors[0]!.message) }
      finally { panel.unmount() }
      agent.approvalValue.value = '3'
      await finishTimers(agent.approve(approval.id))
      expect(agent.orders.value[0]).toMatchObject({ productId: 'milk', quantity: 3 })
      expect(agent.streamSnapshot.value.interruptState.interrupts).toHaveLength(0)
    }
    finally { wrapper.unmount() }
  })

  it('does not execute denied or stale decisions', async () => {
    const { agent, wrapper } = mountAgentHarness()
    try {
      await finishTimers(agent.send('买 1 盒牛奶'))
      const approval = agent.streamSnapshot.value.interruptState.interrupts[0]!
      const stock = agent.products.value.find(product => product.id === 'milk')!.stock
      agent.reject(approval.id)
      await vi.runAllTimersAsync()
      expect(agent.orders.value).toHaveLength(1)
      expect(agent.products.value.find(product => product.id === 'milk')!.stock).toBe(stock)
      if (approval.kind !== 'tool-approval') { throw new Error('Expected bound approval') }
      const result = agent.streamSnapshot.value.messages.flatMap(message => message.parts).filter(part => part.type === 'tool-result').find(part => part.toolCallId === approval.toolCallId)
      expect(result).toMatchObject({ state: 'error', outcome: 'denied' })
      await finishTimers(agent.send('买 1 盒牛奶'))
      await finishTimers(agent.approve(approval.id))
      expect(agent.orders.value).toHaveLength(1)
      expect(agent.streamSnapshot.value.interruptState.interrupts[0]?.id).not.toBe(approval.id)
    }
    finally { wrapper.unmount() }
  })

  it.each(['purchase', 'return'] as const)('revalidates current %s eligibility immediately before mutation', async (type) => {
    const { agent, wrapper } = mountAgentHarness()
    try {
      await finishTimers(agent.send(type === 'purchase' ? '买 1 盒牛奶' : '我要退货'))
      const approval = agent.streamSnapshot.value.interruptState.interrupts[0]!
      const historyLength = agent.history.value.length
      const decision = agent.approve(approval.id)
      if (type === 'purchase') { agent.products.value = agent.products.value.map(product => product.id === 'milk' ? { ...product, stock: 0 } : product) }
      else { agent.orders.value = agent.orders.value.map(order => ({ ...order, status: 'returned' })) }
      await finishTimers(decision)
      expect(agent.orders.value).toHaveLength(1)
      expect(agent.history.value).toHaveLength(historyLength)
      if (approval.kind !== 'tool-approval') { throw new Error('Expected bound approval') }
      const call = agent.streamSnapshot.value.messages.flatMap(message => message.parts).filter(part => part.type === 'tool-call').find(part => part.id === approval.toolCallId)
      expect(call?.state).toBe('error')
      expect(agent.streamSnapshot.value.interruptState.interrupts).toHaveLength(0)
    }
    finally { wrapper.unmount() }
  })

  it('supports return, history, and address configuration intents', async () => {
    const { agent, wrapper } = mountAgentHarness()

    await finishTimers(agent.send('我要退货'))
    expect(agent.pendingAction.value).toMatchObject({ type: 'return' })
    agent.approvalValue.value = 'quality'
    const approval = agentSnapshotProjection(agent.streamSnapshot.value).approvals[0]
    expect(approval).toBeDefined()
    await finishTimers(agent.approve(approval!.id))
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
