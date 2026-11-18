// @vitest-environment jsdom

import type { ChatClientSnapshot, ToolApprovalInterrupt } from '@tanstack/ai-client'
import type { MallAgentController } from './features/mall/useMallAgent'
import { ChatClient, stream } from '@tanstack/ai-client'
import { toolDefinition } from '@tanstack/ai/client'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { z } from 'zod'
import AgentApproval from './components/agent-ui/AgentApproval.vue'
import AgentEventRenderer from './components/agent-ui/AgentEventRenderer.vue'
import { useMallAgent } from './features/mall/useMallAgent'

const tool = toolDefinition({
  name: 'demo.checkout',
  description: 'Native approval test tool',
  inputSchema: z.object({ address: z.string() }),
  needsApproval: true,
}).client()

function approval(id: string, metadata?: Readonly<Record<string, unknown>>): ToolApprovalInterrupt<typeof tool> {
  const originalArgs = { address: `private-argument-${id}` }
  return {
    id,
    interruptId: id,
    reason: 'tool-approval',
    threadId: 'thread',
    interruptedRunId: 'run',
    generation: 0,
    kind: 'tool-approval',
    status: 'pending',
    errors: [],
    canResolve: true,
    toolName: tool.name,
    toolCallId: `call-${id}`,
    originalArgs,
    metadata,
    binding: {
      v: 1,
      kind: 'tool-approval',
      interruptId: id,
      interruptedRunId: 'run',
      generation: 0,
      toolName: tool.name,
      toolCallId: `call-${id}`,
      originalArgs,
      inputSchemaHash: 'input',
      approvalSchemaHash: 'approval',
      responseSchemaHash: 'response',
    },
    cancel: vi.fn(),
    clearResolution: vi.fn(),
    resolveInterrupt: vi.fn(),
  }
}

function mountApprovals(...interrupts: ToolApprovalInterrupt<typeof tool>[]) {
  const client = new ChatClient({ threadId: 'thread', tools: [tool], connection: stream(async function* () {}) })
  const snapshot: ChatClientSnapshot<readonly (typeof tool)[]> = {
    ...client.getSnapshot(),
    interruptState: { interrupts, interruptErrors: [], resuming: false },
  }
  client.dispose()
  return mount(AgentEventRenderer, { props: { snapshot } })
}

describe('native approval previews', () => {
  it('renders only the supplied preview rows in the matching interrupt card', async () => {
    const first = {
      ...approval('purchase', {
        varoApprovalPreview: { requestedBy: ' 商城 Agent ', action: '创建演示订单', impact: '仅更新演示库存', risk: 'private-preview-risk' },
        action: 'private-metadata-action',
      }),
      message: '核对订单信息',
      responseSchema: { description: 'private-response-schema' },
    }
    const second = approval('return', {
      varoApprovalPreview: { requestedBy: '  ', action: '提交退货申请', impact: { note: 'private-preview-impact' } },
      result: 'private-metadata-result',
    })
    const wrapper = mountApprovals(first, second)
    try {
      const cards = wrapper.findAllComponents(AgentApproval)
      expect(cards).toHaveLength(2)
      const [purchase, returned] = cards
      expect(purchase!.text()).toContain('确认工具：demo.checkout')
      expect(purchase!.text()).toContain('核对订单信息')
      expect(purchase!.text()).toContain('发起方：商城 Agent')
      expect(purchase!.text()).toContain('操作：创建演示订单')
      expect(purchase!.text()).toContain('影响范围：仅更新演示库存')
      expect(purchase!.text()).not.toContain('提交退货申请')
      expect(returned!.text()).toContain('tool-approval')
      expect(returned!.text()).toContain('操作：提交退货申请')
      expect(returned!.text()).not.toMatch(/发起方：|影响范围：|创建演示订单/)
      expect(wrapper.html()).not.toContain('private-')

      const reject = returned!.get('button.agent-approval__reject')
      expect(reject.text()).toBe('拒绝')
      await reject.trigger('click')
      expect(wrapper.emitted('reject')).toEqual([['return']])
      expect(wrapper.emitted('cancelInterrupts')).toBeUndefined()
    }
    finally { wrapper.unmount() }
  })

  it.each([
    { name: 'absent', preview: undefined },
    { name: 'blank or non-string', preview: { requestedBy: '', action: 123, impact: '\n ' } },
    { name: 'array', preview: [{ action: 'private-array-action' }] },
  ])('omits all preview rows when the preview is $name', ({ preview }) => {
    const wrapper = mountApprovals(approval('fallback', {
      varoApprovalPreview: preview,
      requestedBy: 'private-metadata-requester',
      action: 'private-metadata-action',
      impact: 'private-metadata-impact',
    }))
    try {
      const card = wrapper.getComponent(AgentApproval)
      expect(card.text()).toContain('确认工具：demo.checkout')
      expect(card.text()).not.toMatch(/发起方：|操作：|影响范围：/)
      expect(wrapper.html()).not.toContain('private-')
    }
    finally { wrapper.unmount() }
  })

  it.each([
    { prompt: '购买一盒牛奶', action: '创建演示订单', impact: '仅更新当前页面的演示订单和库存，并写入页面内历史记录；不会实际扣款。' },
    { prompt: '我要退货', action: '提交演示退货申请', impact: '将当前页面的演示订单标记为已退货，并在页面内历史记录中保存所选退货原因；不会发起真实退款。' },
  ])('renders the mall application preview for $prompt before a decision', async ({ prompt, action, impact }) => {
    let agent!: MallAgentController
    const wrapper = mount(defineComponent({
      setup() {
        agent = useMallAgent()
        return () => h(AgentEventRenderer, { snapshot: agent.streamSnapshot.value })
      },
    }))
    vi.useFakeTimers()
    try {
      const originalOrders = agent.orders.value
      const originalHistory = agent.history.value
      const send = agent.send(prompt)
      await vi.runAllTimersAsync()
      await send
      const card = wrapper.getComponent(AgentApproval)
      expect(card.text()).toContain('发起方：商城演示 Agent')
      expect(card.text()).toContain(`操作：${action}`)
      expect(card.text()).toContain(`影响范围：${impact}`)
      expect(agent.orders.value).toBe(originalOrders)
      expect(agent.history.value).toBe(originalHistory)
    }
    finally {
      wrapper.unmount()
      vi.useRealTimers()
    }
  })
})
