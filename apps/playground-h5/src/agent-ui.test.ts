// @vitest-environment jsdom

import type { ChatClientSnapshot, ToolApprovalInterrupt } from '@tanstack/ai-client'
import { toolDefinition } from '@tanstack/ai/client'
import { ChatClient, stream } from '@tanstack/ai-client'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { AgentApproval, AgentComposer, AgentConversation, AgentEventRenderer, AgentFileDiff, AgentMarkdown, AgentThinking } from './components/agent-ui'
import AgentChat from './components/blocks/agent-chat.vue'
import { agentConversationHistory } from './components/agent-ui/presentation'

const approvalTool = toolDefinition({ name: 'registry.inspect', description: 'UI approval fixture', needsApproval: true }).client()
type ApprovalSnapshot = ChatClientSnapshot<Array<typeof approvalTool>, any>

function chatSnapshot(update: Partial<ApprovalSnapshot> = {}): ApprovalSnapshot {
  const client = new ChatClient({ threadId: 'ui-test', tools: [approvalTool], connection: stream(async function* () {}) })
  const snapshot = client.getSnapshot()
  client.dispose()
  return { ...snapshot, ...update }
}

function approvalInterrupt(id = 'approval', generation = 1): ToolApprovalInterrupt<typeof approvalTool> {
  return {
    id, interruptId: id, reason: 'tool-approval', message: '确认发布',
    kind: 'tool-approval', threadId: 'ui-test', interruptedRunId: 'run', generation,
    status: 'pending', errors: [], canResolve: true,
    toolName: 'registry.inspect', toolCallId: 'tool', originalArgs: {},
    binding: {
      v: 1, kind: 'tool-approval', interruptId: id, interruptedRunId: 'run', generation,
      toolName: 'registry.inspect', toolCallId: 'tool', originalArgs: {},
      inputSchemaHash: 'input', approvalSchemaHash: 'approval', responseSchemaHash: 'response',
    },
    cancel: vi.fn(), clearResolution: vi.fn(), resolveInterrupt: vi.fn(),
  }
}

describe('H5 Agent UI', () => {
  it('renders structured Markdown without injecting unsafe links', () => {
    const wrapper = mount(AgentMarkdown, {
      props: {
        content: '## 结果\n\n| 平台 | 状态 |\n| --- | --- |\n| H5 | **完成** |\n\n[危险链接](javascript:alert(1))',
        final: true,
      },
    })

    expect(wrapper.get('h2').text()).toBe('结果')
    expect(wrapper.get('table').text()).toContain('H5')
    expect(wrapper.get('strong').text()).toBe('完成')
    expect(wrapper.find('a[href^="javascript:"]').exists()).toBe(false)
  })

  it('composes reasoning, tools, streaming content, and approval state', async () => {
    const interrupt = approvalInterrupt()
    const snapshot = chatSnapshot({
      messages: [{
        id: 'message', role: 'assistant', parts: [
          { type: 'thinking', content: '检查 Registry' },
          { type: 'tool-call', id: 'tool', name: 'registry.inspect', arguments: '{}', state: 'complete', output: '双端通过' },
          { type: 'text', content: '**发布计划**' },
        ],
      }],
      interruptState: { interrupts: [interrupt], interruptErrors: [], resuming: false },
    })
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })

    await wrapper.findAll('button').find(button => button.text().includes('推理过程'))!.trigger('click')
    expect(wrapper.text()).toContain('检查 Registry')
    expect(wrapper.text()).toContain('registry.inspect')
    expect(wrapper.get('.agent-markdown__strong').text()).toBe('发布计划')
    expect(wrapper.text()).toContain('确认发布')

    await wrapper.findAll('button').find(button => button.text() === '确认')!.trigger('click')
    expect(wrapper.emitted('approve')?.[0]).toEqual(['approval'])
    expect(interrupt.resolveInterrupt).not.toHaveBeenCalled()
  })

  it('does not redisplay the previous answer while a new turn is submitted or fails before text', async () => {
    const snapshot = chatSnapshot({
      messages: [
        { id: 'old', role: 'assistant', parts: [{ type: 'text', content: '上一轮回答' }] },
        { id: 'new', role: 'user', parts: [{ type: 'text', content: '新的问题' }] },
      ],
      status: 'submitted', isLoading: true,
    })
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })
    try {
      expect(wrapper.text()).not.toContain('上一轮回答')
      expect(wrapper.get('.agent-loading').text()).toContain('正在生成回答')
      await wrapper.setProps({ snapshot: { ...snapshot, status: 'error', isLoading: false, error: new Error('新请求失败') } })
      expect(wrapper.get('[role="alert"]').text()).toContain('新请求失败')
      expect(wrapper.text()).not.toContain('上一轮回答')
    }
    finally { wrapper.unmount() }
  })

  it.each(['unresolvable', 'staged', 'submitting', 'resuming'] as const)('does not offer a duplicate or unsupported %s approval', (state) => {
    const interrupt = approvalInterrupt()
    const snapshot = chatSnapshot({
      interruptState: {
        interrupts: [{ ...interrupt, canResolve: state !== 'unresolvable', status: state === 'submitting' || state === 'staged' ? state : 'pending' }],
        interruptErrors: [], resuming: state === 'resuming',
      },
    })
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })
    try {
      expect(wrapper.get<HTMLButtonElement>('.agent-approval__approve').element.disabled).toBe(true)
      wrapper.getComponent(AgentApproval).vm.$emit('approve', '')
      expect(wrapper.emitted('approve')).toBeUndefined()
    }
    finally { wrapper.unmount() }
  })

  it('shows an unbound AG-UI pause without pretending that generation is active', () => {
    const interrupt = { ...approvalInterrupt(), kind: 'unbound' as const, binding: undefined, canResolve: false as const }
    const snapshot = chatSnapshot({ interruptState: { interrupts: [interrupt], interruptErrors: [], resuming: false } })
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })
    try {
      expect(wrapper.attributes('data-status')).toBe('waiting')
      expect(wrapper.find('.agent-loading').exists()).toBe(false)
      expect(wrapper.findAll('button').some(button => button.text() === '确认')).toBe(false)
    }
    finally { wrapper.unmount() }
  })


  it('preserves paused and stopped SDK output while surfacing real generation errors', async () => {
    const snapshot = chatSnapshot({
      messages: [{ id: 'message', role: 'assistant', parts: [{ type: 'text', content: '保留回答' }] }],
      interruptState: { interrupts: [approvalInterrupt()], interruptErrors: [], resuming: false },
    })
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })
    try {
      expect(wrapper.get('.agent-stream').attributes('data-status')).toBe('waiting')
      expect(wrapper.find('.agent-ui__cursor').exists()).toBe(false)
      expect(wrapper.find('.agent-loading').exists()).toBe(false)
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)

      await wrapper.setProps({ snapshot: { ...snapshot, interruptState: { interrupts: [], interruptErrors: [], resuming: false } } })
      expect(wrapper.get('.agent-stream').attributes('data-status')).toBe('completed')
      expect(wrapper.get('.agent-markdown').text()).toBe('保留回答')
      expect(wrapper.get('.agent-markdown').attributes('data-final')).toBe('true')
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
      expect(wrapper.find('.agent-ui__cursor').exists()).toBe(false)

      await wrapper.setProps({ snapshot: { ...snapshot, status: 'error', error: new Error('连接中断'), interruptState: { interrupts: [], interruptErrors: [], resuming: false } } })
      expect(wrapper.get('[role="alert"]').text()).toContain('连接中断')
      await wrapper.get('[role="alert"] button').trigger('click')
      expect(wrapper.emitted('retry')).toEqual([[]])
    }
    finally {
      wrapper.unmount()
    }
  })

  it.each(['replacement', 'removal', 'generation'] as const)('rejects an approval callback captured before %s', async (change) => {
    const original = approvalInterrupt('approval-a')
    const snapshot = chatSnapshot({ interruptState: { interrupts: [original], interruptErrors: [], resuming: false } })
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })
    try {
      const card = wrapper.getComponent(AgentApproval)
      const approve = card.vm.$.vnode.props!.onApprove as () => void
      const reject = card.vm.$.vnode.props!.onReject as () => void
      const replacement = change === 'generation' ? approvalInterrupt('approval-a', 2) : approvalInterrupt('approval-b')
      await wrapper.setProps({ snapshot: chatSnapshot({ ...snapshot, interruptState: { interrupts: change === 'removal' ? [] : [replacement], interruptErrors: [], resuming: false } }) })
      expect(() => { approve(); reject() }).not.toThrow()
      expect(wrapper.emitted('approve')).toBeUndefined()
      expect(wrapper.emitted('reject')).toBeUndefined()
      if (change !== 'removal') {
        await wrapper.get('.agent-approval__approve').trigger('click')
        expect(wrapper.emitted('approve')).toEqual([[replacement.id]])
      }
    }
    finally { wrapper.unmount() }
  })

  it.each(['expired', 'stale', 'conflict', 'invalid-response-schema'] as const)('does not resolve an ineligible %s approval error', (code) => {
    const interrupt = approvalInterrupt()
    const snapshot = chatSnapshot({ interruptState: { interrupts: [{ ...interrupt, status: 'error', errors: [{
      scope: 'item', source: 'server', code, message: '当前审批不可提交', retryable: false,
      interruptId: interrupt.id, threadId: interrupt.threadId, interruptedRunId: interrupt.interruptedRunId, generation: interrupt.generation,
    }] }], interruptErrors: [], resuming: false } })
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })
    try {
      expect(wrapper.get('[role="alert"]').text()).toContain('当前审批不可提交')
      expect(wrapper.getComponent(AgentApproval).props('disabled')).toBe(true)
      wrapper.getComponent(AgentApproval).vm.$emit('approve', '')
      expect(wrapper.emitted('approve')).toBeUndefined()
    }
    finally { wrapper.unmount() }
  })

  it('keeps validation errors visible and permits application-owned corrected resubmission', async () => {
    const interrupt = approvalInterrupt()
    const snapshot = chatSnapshot({ interruptState: {
      interrupts: [{ ...interrupt, status: 'error', errors: [{
        scope: 'item', source: 'client', code: 'invalid-payload', message: '请输入确认说明', retryable: false,
        interruptId: interrupt.id, threadId: interrupt.threadId, interruptedRunId: interrupt.interruptedRunId, generation: interrupt.generation,
      }] }], interruptErrors: [], resuming: false,
    } })
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })
    try {
      expect(wrapper.get('[role="alert"]').text()).toContain('请输入确认说明')
      expect(wrapper.get<HTMLButtonElement>('.agent-approval__approve').element.disabled).toBe(false)
      await wrapper.get('.agent-approval__approve').trigger('click')
      await wrapper.get('.agent-approval__approve').trigger('click')
      expect(wrapper.emitted('approve')).toEqual([['approval'], ['approval']])
      expect(wrapper.get('[role="alert"]').text()).toContain('请输入确认说明')
      expect(interrupt.resolveInterrupt).not.toHaveBeenCalled()
    }
    finally { wrapper.unmount() }
  })

  it('lists multiple approvals and forwards guarded interrupt recovery without generation retry', async () => {
    const first = approvalInterrupt('a')
    const second = approvalInterrupt('b')
    const snapshot = chatSnapshot({
      messages: [{ id: 'answer', role: 'assistant', parts: [{ type: 'text', content: '保留中断回答' }] }],
      status: 'error', error: new Error('恢复连接失败'),
      interruptState: { interrupts: [first, { ...second, status: 'error', errors: [{
        scope: 'item', source: 'server', code: 'conflict', message: '审批状态冲突', retryable: true,
        interruptId: second.id, threadId: second.threadId, interruptedRunId: second.interruptedRunId, generation: second.generation,
      }] }], interruptErrors: [{
        scope: 'batch', source: 'transport', code: 'transport', message: '恢复请求未送达', retryable: true,
        threadId: first.threadId, interruptedRunId: first.interruptedRunId, generation: first.generation, interruptIds: [first.id, second.id],
      }], resuming: false },
    })
    const wrapper = mount(AgentChat, { props: { snapshot } })
    try {
      expect(wrapper.findAllComponents(AgentApproval)).toHaveLength(2)
      expect(wrapper.text()).toContain('恢复连接失败')
      expect(wrapper.text()).toContain('审批状态冲突')
      expect(wrapper.text()).toContain('恢复请求未送达')
      expect(wrapper.text()).not.toContain('生成失败，请重试')
      const retry = wrapper.findAll('button').find(button => button.text() === '重试中断')!
      const cancel = wrapper.findAll('button').find(button => button.text() === '取消中断')!
      const staleRetry = retry.element
      const staleCancel = cancel.element
      await retry.trigger('click')
      await cancel.trigger('click')
      expect(wrapper.emitted('retryInterrupts')).toEqual([[]])
      expect(wrapper.emitted('cancelInterrupts')).toEqual([[]])
      expect(wrapper.emitted('retry')).toBeUndefined()
      await wrapper.setProps({ snapshot: chatSnapshot() })
      await wrapper.setProps({ snapshot: chatSnapshot({ ...snapshot, interruptState: { ...snapshot.interruptState, interrupts: [approvalInterrupt('c', 2)], interruptErrors: [] } }) })
      staleRetry.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      staleCancel.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      expect(wrapper.emitted('retryInterrupts')).toHaveLength(1)
      expect(wrapper.emitted('cancelInterrupts')).toHaveLength(1)
    }
    finally { wrapper.unmount() }
  })

  it('retains ordered SDK history and failed tool receipts after a later assistant message', async () => {
    const messages: ApprovalSnapshot['messages'] = [
      { id: 'old', role: 'assistant', parts: [
        { type: 'text', content: '执行前' },
        { type: 'thinking', content: '检查权限' },
        { type: 'tool-call', id: 'failed-tool', name: 'registry.inspect', arguments: '{}', state: 'error', output: '失败工具的输出' },
        { type: 'text', content: '执行后' },
        { type: 'tool-call', id: 'remote-tool', name: 'registry.inspect', arguments: '{}', state: 'complete' },
        { type: 'structured-output', raw: '{"receipt":"结构化收据"}', status: 'complete', data: { receipt: '结构化收据' } },
      ] },
      { id: 'result', role: 'assistant', parts: [{ type: 'tool-result', toolCallId: 'failed-tool', content: '失败工具的输出', error: '调用失败', state: 'error' }] },
      { id: 'latest', role: 'assistant', parts: [
        { type: 'tool-result', toolCallId: 'remote-tool', content: '跨消息结果', state: 'complete' },
        { type: 'text', content: '最新回答' },
      ] },
      { id: 'terminal', role: 'assistant', parts: [] },
    ]
    const snapshot = chatSnapshot({ messages })
    const wrapper = mount(AgentChat, { props: { snapshot, messages: agentConversationHistory(snapshot) } })
    try {
      const history = wrapper.getComponent(AgentConversation)
      expect(history.text()).toContain('执行前')
      expect(history.text()).toContain('执行后')
      expect(history.text()).toContain('失败工具的输出')
      expect(history.text()).toContain('跨消息结果')
      expect(history.get('[data-message-part="data"]').text()).toContain('结构化收据')
      expect(history.findAll('.agent-message-parts')).toHaveLength(1)
      expect(history.find('.agent-stream').exists()).toBe(false)
      expect(wrapper.findAll('.agent-stream')).toHaveLength(1)
      expect(history.text()).not.toContain('最新回答')
      expect(wrapper.text().match(/最新回答/g)).toHaveLength(1)
      const failedTool = history.get('.agent-tool[data-status="failed"]')
      expect(failedTool.text()).toContain('registry.inspect')
      expect(failedTool.find('i').classes().join(' ')).toContain('--varo-agent-danger')
      const order = history.findAll('.agent-message, .agent-thinking, .agent-tool').map(node => node.text())
      expect(order[0]).toContain('执行前')
      expect(order[1]).toContain('推理过程')
      expect(order[2]).toContain('registry.inspect')
      expect(order[3]).toContain('执行后')
      await history.findAll('button').find(button => button.text().includes('推理过程'))!.trigger('click')
      expect(history.text()).toContain('检查权限')
    }
    finally { wrapper.unmount() }
  })

  it('keeps generation errors visible when only the application may offer retry', () => {
    const wrapper = mount(AgentEventRenderer, { props: {
      snapshot: chatSnapshot({ status: 'error', error: new Error('连接中断') }), retryable: false,
    } })
    try {
      expect(wrapper.get('[role="alert"]').text()).toContain('连接中断')
      expect(wrapper.find('[role="alert"] button').exists()).toBe(false)
      expect(wrapper.emitted('retry')).toBeUndefined()
    }
    finally { wrapper.unmount() }
  })

  it('keeps every pending approval distinct and never executes SDK actions', () => {
    const a = approvalInterrupt('a')
    const b = approvalInterrupt('b')
    const wrapper = mount(AgentEventRenderer, { props: { snapshot: chatSnapshot({ interruptState: { interrupts: [a, b], interruptErrors: [], resuming: false } }) } })
    try {
      const approvals = wrapper.findAllComponents(AgentApproval)
      expect(approvals).toHaveLength(2)
      approvals[1]!.vm.$emit('approve', '')
      approvals[0]!.vm.$emit('reject')
      expect(wrapper.emitted('approve')).toEqual([['b']])
      expect(wrapper.emitted('reject')).toEqual([['a']])
      expect(a.resolveInterrupt).not.toHaveBeenCalled()
      expect(b.resolveInterrupt).not.toHaveBeenCalled()
    }
    finally { wrapper.unmount() }
  })

  it('submits explicit composer input and prompt suggestions', async () => {
    const composer = mount(AgentComposer, {
      props: { modelValue: '分析双端方案', suggestions: ['生成发布计划'] },
    })

    await composer.get('button[aria-label="发送"]').trigger('click')
    expect(composer.emitted('submit')?.[0]).toEqual(['分析双端方案'])

    await composer.findAll('button').find(button => button.text() === '生成发布计划')!.trigger('click')
    expect(composer.emitted('submit')?.[1]).toEqual(['生成发布计划'])
  })

  it('reconciles rejected controlled edits before displaying or submitting a draft', async () => {
    const composer = mount(AgentComposer, { props: { modelValue: 'accepted draft' } })
    try {
      const input = composer.get('textarea')
      await input.setValue('rejected replacement')
      expect(input.element.value).toBe('accepted draft')
      await input.trigger('keydown', { key: 'Enter' })
      expect(composer.emitted('submit')).toEqual([['accepted draft']])

      await composer.setProps({ modelValue: '' })
      await input.setValue('rejected empty replacement')
      expect(input.element.value).toBe('')
      expect(composer.get('button[aria-label="发送"]').attributes('disabled')).toBeDefined()
      await input.trigger('keydown', { key: 'Enter' })
      expect(composer.emitted('submit')).toEqual([['accepted draft']])
    }
    finally { composer.unmount() }
  })

  it('preserves an active IME composition and reconciles only its committed edit', async () => {
    const composer = mount(AgentComposer, { props: { modelValue: '已接受' } })
    try {
      const input = composer.get('textarea')
      await input.trigger('compositionstart')
      await input.setValue('正在组合')
      expect(input.element.value).toBe('正在组合')
      await input.trigger('keydown', { key: 'Enter', isComposing: true })
      expect(composer.emitted('submit')).toBeUndefined()
      await input.trigger('compositionend')
      expect(input.element.value).toBe('已接受')
      await input.trigger('keydown', { key: 'Enter' })
      expect(composer.emitted('submit')).toEqual([['已接受']])
    }
    finally { composer.unmount() }
  })

  it('blocks every submit path without disabling editing while a receipt is pending', async () => {
    const composer = mount(AgentComposer, {
      props: { modelValue: 'draft', submitDisabled: true, suggestions: ['Suggested prompt'] },
    })
    try {
      const input = composer.get('textarea')
      const send = composer.get('button[aria-label="发送"]')
      const suggestion = composer.findAll('button').find(button => button.text() === 'Suggested prompt')!
      expect(input.attributes('disabled')).toBeUndefined()
      expect(send.attributes('disabled')).toBeDefined()
      expect(suggestion.attributes('disabled')).toBeDefined()
      await input.trigger('keydown', { key: 'Enter' })
      await suggestion.trigger('click')
      expect(composer.emitted('submit')).toBeUndefined()
      await composer.setProps({ submitDisabled: false, modelValue: 'ready to send' })
      await input.trigger('keydown', { key: 'Enter' })
      expect(composer.emitted('submit')).toEqual([['ready to send']])
    }
    finally { composer.unmount() }
  })

  it('reviews diffs in unified and split layouts', async () => {
    const lines = [
      { content: '@@ -17,2 +17,3 @@ stream', type: 'hunk' as const },
      { content: 'status: \'idle\'', id: 'old', oldNumber: 17, type: 'remove' as const },
      { content: 'status: \'streaming\'', id: 'new', newNumber: 17, type: 'add' as const },
      { content: 'schedule(frame)', newNumber: 18, type: 'add' as const },
      { collapsedLines: 12, content: '@@ More context', id: 'context', type: 'hunk' as const },
    ]
    const wrapper = mount(AgentFileDiff, {
      props: { filename: 'src/runtime/stream.ts', lines },
    })

    expect(wrapper.get('.agent-file-diff__counts').text()).toBe('+2−1')
    expect(wrapper.findAll('.agent-file-diff__inline-change').map(node => node.text())).toEqual(['idle', 'streaming'])

    await wrapper.findAll('.agent-file-diff__segmented button')[1].trigger('click')
    expect(wrapper.attributes('data-view')).toBe('split')
    expect(wrapper.emitted('update:view')?.[0]).toEqual(['split'])
    expect(wrapper.findAll('.agent-file-diff__split-row')).toHaveLength(2)

    await wrapper.get('.agent-file-diff__side[data-type="remove"]').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ index: 1, side: 'old' })

    await wrapper.findAll('.agent-file-diff__hunk')[1].trigger('click')
    expect(wrapper.emitted('expand')?.[0]).toEqual([lines[4], 4])
  })

  it('keeps controlled diff state parent-owned', async () => {
    const wrapper = mount(AgentFileDiff, {
      props: {
        filename: 'src/controlled.ts',
        lines: [{ content: 'const ready = true', newNumber: 1, type: 'add' }],
        open: false,
        view: 'unified',
      },
    })

    expect(wrapper.find('.agent-file-diff__body').exists()).toBe(false)
    await wrapper.setProps({ open: true })
    await wrapper.findAll('.agent-file-diff__segmented button')[1].trigger('click')

    expect(wrapper.attributes('data-view')).toBe('unified')
    expect(wrapper.emitted('update:view')?.[0]).toEqual(['split'])
  })

  it('renders a padded thinking disclosure with real SVG icons', async () => {
    const wrapper = mount(AgentThinking, {
      props: {
        className: 'rounded-none shadow-none',
        defaultOpen: true,
        steps: [{ id: 'registry', title: '检查 Registry', detail: '已读取组件清单', status: 'completed' }],
      },
    })

    expect(wrapper.classes()).toContain('rounded-none')
    expect(wrapper.classes()).not.toContain('rounded-2xl')
    expect(wrapper.get('.agent-thinking__icon svg').attributes('viewBox')).toBe('0 0 24 24')
    expect(wrapper.find('.agent-thinking__body').exists()).toBe(true)

    await wrapper.get('.agent-thinking__trigger').trigger('click')
    expect(wrapper.find('.agent-thinking__body').exists()).toBe(false)
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('ships the Agent Chat block as a complete conversation shell', async () => {
    const wrapper = mount(AgentChat, {
      props: {
        messages: [{ content: '欢迎使用', id: 'welcome', role: 'assistant' }],
        suggestions: ['分析需求'],
        title: '项目 Agent',
      },
    })

    expect(wrapper.text()).toContain('欢迎使用')
    await wrapper.get('textarea').setValue('生成方案')
    await wrapper.get('button[aria-label="发送"]').trigger('click')
    expect(wrapper.emitted('submit')?.[0]).toEqual(['生成方案'])
  })

  it('retains the current turn result when the SDK appends an empty terminal placeholder', () => {
    const snapshot = chatSnapshot({ messages: [
      { id: 'request', role: 'user', parts: [{ type: 'text', content: '执行当前请求' }] },
      { id: 'result', role: 'assistant', parts: [{ type: 'text', content: '当前轮操作结果' }] },
      { id: 'terminal', role: 'assistant', parts: [] },
    ] })
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })
    try { expect(wrapper.get('.agent-stream').text()).toContain('当前轮操作结果') }
    finally { wrapper.unmount() }
  })
})
