// @vitest-environment jsdom

import type { ChatClientSnapshot, ToolApprovalInterrupt } from '@tanstack/ai-client'
import { toolDefinition } from '@tanstack/ai/client'
import { ChatClient, stream } from '@tanstack/ai-client'
import type { AgentFineTuneControl } from './components/agent-ui/advanced-types'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AgentActivity from './components/agent-ui/AgentActivity.vue'
import AgentApproval from './components/agent-ui/AgentApproval.vue'
import AgentConversation from './components/agent-ui/AgentConversation.vue'
import AgentInterruptControls from './components/agent-ui/AgentInterruptControls.vue'
import { agentConversationHistory } from './components/agent-ui/presentation'
import AgentCitations from './components/agent-ui/AgentCitations.vue'
import AgentCodeBlock from './components/agent-ui/AgentCodeBlock.vue'
import AgentCommandSearch from './components/agent-ui/AgentCommandSearch.vue'
import AgentContextCard from './components/agent-ui/AgentContextCard.vue'
import AgentDiffTable from './components/agent-ui/AgentDiffTable.vue'
import AgentEventRenderer from './components/agent-ui/AgentEventRenderer.vue'
import AgentFileDiff from './components/agent-ui/AgentFileDiff.vue'
import AgentFilterTable from './components/agent-ui/AgentFilterTable.vue'
import AgentFineTune from './components/agent-ui/AgentFineTune.vue'
import AgentFlowchart from './components/agent-ui/AgentFlowchart.vue'
import AgentImageGeneration from './components/agent-ui/AgentImageGeneration.vue'
import AgentInsightCard from './components/agent-ui/AgentInsightCard.vue'
import AgentMessageScroller from './components/agent-ui/AgentMessageScroller.vue'
import AgentRadioGroup from './components/agent-ui/AgentRadioGroup.vue'
import AgentRecordsTable from './components/agent-ui/AgentRecordsTable.vue'
import AgentSelectionActions from './components/agent-ui/AgentSelectionActions.vue'
import AgentSidebar from './components/agent-ui/AgentSidebar.vue'
import AgentThinking from './components/agent-ui/AgentThinking.vue'
import AgentToolApproval from './components/agent-ui/AgentToolApproval.vue'
import AgentToolResult from './components/agent-ui/AgentToolResult.vue'

const approvalTool = toolDefinition({ name: 'registry.inspect', description: 'Native UI approval fixture', needsApproval: true }).client()
type ApprovalSnapshot = ChatClientSnapshot<Array<typeof approvalTool>, any>

function chatSnapshot(update: Partial<ApprovalSnapshot> = {}): ApprovalSnapshot {
  const client = new ChatClient({ threadId: 'native-ui-test', tools: [approvalTool], connection: stream(async function* () {}) })
  const snapshot = client.getSnapshot()
  client.dispose()
  return { ...snapshot, ...update }
}

function approvalInterrupt(id = 'approval', generation = 1): ToolApprovalInterrupt<typeof approvalTool> {
  return {
    id, interruptId: id, reason: 'tool-approval', message: '确认发布',
    kind: 'tool-approval', threadId: 'native-ui-test', interruptedRunId: 'run', generation,
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

describe('advanced mini-program Agent UI', () => {
  it('keeps motion radio choices controlled', async () => {
    const wrapper = mount(AgentRadioGroup, {
      props: { choices: [{ label: '仅验证', value: 'verify' }, { label: '发布', value: 'publish' }], value: 'verify' },
    })
    expect(wrapper.findAll('[role="radio"]')[0]!.attributes('hover-class')).toBe('agent-radio__item--pressed')
    await wrapper.findAll('[role="radio"]')[1].trigger('click')
    expect(wrapper.emitted('update:value')?.[0]).toEqual(['publish'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['publish'])
  })

  it('uses target-aware class merging for mini-program Agent surfaces', async () => {
    const thinking = mount(AgentThinking, {
      props: {
        className: 'rounded-none shadow-none',
        defaultOpen: true,
        steps: [{ id: 'reason', title: '检查 Registry', status: 'completed' }],
      },
    })
    expect(thinking.classes()).toContain('rounded-none')
    expect(thinking.classes()).not.toContain('rounded-2xl')
    expect(thinking.get('.agent-thinking__icon image').attributes('src')).toContain('data:image/svg+xml;base64,')

    const image = mount(AgentImageGeneration, {
      props: { className: 'rounded-none shadow-none', progress: 68, status: 'generating' },
    })
    expect(image.classes()).toContain('rounded-none')
    expect(image.classes()).not.toContain('rounded-2xl')
    expect(image.text()).toContain('68%')
  })

  it('renders streaming Agent text without a scoped-slot feedback loop', async () => {
    const snapshot = chatSnapshot({
      messages: [{ id: 'stream', role: 'assistant', parts: [
        { type: 'thinking', content: '识别退货意图' },
        { type: 'text', content: '正在处理' },
      ] }],
      status: 'streaming', isLoading: true,
    })
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })
    expect(wrapper.get('.agent-stream').text()).toContain('正在处理')
    expect(wrapper.find('.agent-markdown').exists()).toBe(false)

    await wrapper.setProps({
      snapshot: {
        ...snapshot,
        messages: [{ id: 'stream', role: 'assistant', parts: [{ type: 'text', content: '正在处理退货' }] }],
      },
    })
    expect(wrapper.get('.agent-stream').text()).toContain('正在处理退货')
  })

  it('preserves stopped SDK output without presenting it as a generation failure', async () => {
    const snapshot = chatSnapshot({
      messages: [{ id: 'message', role: 'assistant', parts: [{ type: 'text', content: '```\n保留回答\n```' }] }],
      status: 'streaming', isLoading: true,
    })
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })
    try {
      expect(wrapper.get('.agent-stream').attributes('data-status')).toBe('streaming')
      expect(wrapper.find('.agent-stream__cursor').exists()).toBe(true)
      expect(wrapper.find('.agent-loading').exists()).toBe(false)
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)

      await wrapper.setProps({ snapshot: { ...snapshot, status: 'ready', isLoading: false } })
      expect(wrapper.get('.agent-stream').attributes('data-status')).toBe('completed')
      expect(wrapper.get('.agent-markdown scroll-view text').text()).toBe('保留回答')
      expect(wrapper.get('.agent-markdown').attributes('data-final')).toBe('true')
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
      expect(wrapper.find('.agent-stream__cursor').exists()).toBe(false)

      await wrapper.setProps({ snapshot: { ...snapshot, status: 'error', isLoading: false, error: new Error('连接中断') } })
      expect(wrapper.get('[role="alert"]').text()).toContain('连接中断')
      await wrapper.get('[role="alert"] button').trigger('click')
      expect(wrapper.emitted('retry')).toEqual([[]])
    }
    finally {
      wrapper.unmount()
    }
  })

  it.each(['replacement', 'removal', 'generation'] as const)('rejects a native approval callback captured before %s', async (change) => {
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
        wrapper.getComponent(AgentApproval).vm.$emit('approve', '')
        expect(wrapper.emitted('approve')).toEqual([[replacement.id]])
      }
    }
    finally { wrapper.unmount() }
  })

  it.each(['unresolvable', 'staged', 'submitting', 'resuming'] as const)('guards a previously captured native approval when %s', async (state) => {
    const interrupt = approvalInterrupt()
    const snapshot = chatSnapshot({ interruptState: { interrupts: [interrupt], interruptErrors: [], resuming: false } })
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })
    try {
      const approve = wrapper.getComponent(AgentApproval).vm.$.vnode.props!.onApprove as () => void
      await wrapper.setProps({ snapshot: chatSnapshot({ ...snapshot, interruptState: {
        interrupts: [{ ...interrupt, canResolve: state !== 'unresolvable', status: state === 'staged' || state === 'submitting' ? state : 'pending' }],
        interruptErrors: [], resuming: state === 'resuming',
      } }) })
      approve()
      expect(wrapper.emitted('approve')).toBeUndefined()
      expect(wrapper.getComponent(AgentApproval).props('disabled')).toBe(true)
    }
    finally { wrapper.unmount() }
  })

  it.each(['expired', 'stale', 'conflict', 'invalid-response-schema'] as const)('does not resolve an ineligible native %s approval error', (code) => {
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

  it('shows native validation errors while allowing corrected application resubmission', async () => {
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
      expect(wrapper.getComponent(AgentApproval).props('disabled')).toBe(false)
      await wrapper.get('button.agent-approval__approve').trigger('click')
      await wrapper.get('button.agent-approval__approve').trigger('click')
      expect(wrapper.emitted('approve')).toEqual([['approval'], ['approval']])
      expect(wrapper.get('[role="alert"]').text()).toContain('请输入确认说明')
      expect(interrupt.resolveInterrupt).not.toHaveBeenCalled()
    }
    finally { wrapper.unmount() }
  })

  it('accepts a newly received native approval and offers cancellation after snapshot serialization', async () => {
    const wrapper = mount(AgentEventRenderer, { props: { snapshot: chatSnapshot() } })
    try {
      const snapshot = chatSnapshot({ interruptState: { interrupts: [approvalInterrupt()], interruptErrors: [], resuming: false } })
      await wrapper.setProps({ snapshot: JSON.parse(JSON.stringify(snapshot)) })
      await wrapper.get('button.agent-approval__approve').trigger('click')
      expect(wrapper.emitted('approve')).toEqual([['approval']])
      await wrapper.findAll('button').find(button => button.text() === '取消中断')!.trigger('click')
      expect(wrapper.emitted('cancelInterrupts')).toEqual([[]])
    }
    finally { wrapper.unmount() }
  })

  it('shows all native interrupt failures and guards transaction recovery independently of generation retry', async () => {
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
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })
    try {
      expect(wrapper.findAllComponents(AgentApproval)).toHaveLength(2)
      expect(wrapper.text()).toContain('恢复连接失败')
      expect(wrapper.text()).toContain('审批状态冲突')
      expect(wrapper.text()).toContain('恢复请求未送达')
      expect(wrapper.text()).not.toContain('生成失败')
      const controls = wrapper.getComponent(AgentInterruptControls)
      const retry = controls.vm.$.vnode.props!.onRetryInterrupts as (key: string) => void
      const cancel = controls.vm.$.vnode.props!.onCancelInterrupts as (key: string) => void
      const key = controls.props('projection').transactionKey
      await wrapper.findAll('button').find(button => button.text() === '重试中断')!.trigger('click')
      await wrapper.findAll('button').find(button => button.text() === '取消中断')!.trigger('click')
      expect(wrapper.emitted('retryInterrupts')).toEqual([[]])
      expect(wrapper.emitted('cancelInterrupts')).toEqual([[]])
      expect(wrapper.emitted('retry')).toBeUndefined()
      await wrapper.setProps({ snapshot: chatSnapshot({ ...snapshot, interruptState: { ...snapshot.interruptState, resuming: true } }) })
      retry(key)
      cancel(key)
      await wrapper.setProps({ snapshot: chatSnapshot({ ...snapshot, interruptState: { ...snapshot.interruptState, interrupts: [approvalInterrupt('a', 2)], interruptErrors: [] } }) })
      retry(key)
      cancel(key)
      expect(wrapper.emitted('retryInterrupts')).toHaveLength(1)
      expect(wrapper.emitted('cancelInterrupts')).toHaveLength(1)
    }
    finally { wrapper.unmount() }
  })

  it('preserves native historical part order, cross-message results, and failed tool status', async () => {
    const messages: ApprovalSnapshot['messages'] = [
      { id: 'old', role: 'assistant', parts: [
        { type: 'text', content: '```\n执行前\n```' },
        { type: 'thinking', content: '检查权限' },
        { type: 'tool-call', id: 'failed-tool', name: 'registry.inspect', arguments: '{}', state: 'error', output: '失败工具的输出' },
        { type: 'text', content: '```\n执行后\n```' },
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
    const wrapper = mount(AgentConversation, { props: { messages: agentConversationHistory(snapshot), contextMessages: snapshot.messages } })
    try {
      expect(wrapper.text()).toContain('执行前')
      expect(wrapper.text()).toContain('执行后')
      expect(wrapper.text()).toContain('失败工具的输出')
      expect(wrapper.text()).toContain('跨消息结果')
      expect(wrapper.get('[data-message-part="data"]').text()).toContain('结构化收据')
      expect(wrapper.findAll('.agent-message-parts')).toHaveLength(1)
      expect(wrapper.find('.agent-stream').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('最新回答')
      const failedTool = wrapper.get('.agent-tool[data-status="failed"]')
      expect(failedTool.text()).toContain('registry.inspect')
      expect(failedTool.find('[aria-hidden="true"]').classes().join(' ')).toContain('--varo-agent-danger')
      expect(wrapper.text()).toContain('调用失败')
      expect(wrapper.findAll('[data-message-part]').map(node => node.attributes('data-message-part'))).toEqual(['text', 'thinking', 'tool', 'text', 'tool', 'data'])
      await wrapper.findAll('button').find(button => button.text().includes('推理过程'))!.trigger('click')
      expect(wrapper.text()).toContain('检查权限')
    }
    finally { wrapper.unmount() }
  })

  it('keeps native generation errors visible without offering application-disabled retry', () => {
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

  it('keeps native pending approval intents separate without executing SDK actions', () => {
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

  it('supports file diff layouts and tool approval decisions', async () => {
    const diff = mount(AgentFileDiff, {
      props: {
        filename: 'src/agent.ts',
        lines: [
          { content: 'status: \'idle\'', oldNumber: 18, type: 'remove' },
          { content: 'status: \'streaming\'', newNumber: 18, type: 'add' },
        ],
      },
    })
    expect(diff.get('[data-kind="addition"]').text()).toBe('+1')
    expect(diff.get('[data-kind="deletion"]').text()).toBe('−1')
    await diff.findAll('.agent-file-diff__segmented .agent-file-diff__control')[1].trigger('click')
    expect(diff.attributes('data-view')).toBe('split')
    expect(diff.emitted('update:view')?.[0]).toEqual(['split'])
    await diff.findAll('.agent-file-diff__action')[1].trigger('click')
    expect(diff.emitted('accept')).toHaveLength(1)

    const approval = mount(AgentToolApproval, { props: { tool: 'npm.publish', remember: true } })
    await approval.findAll('.agent-tool-approval__actions button')[1].trigger('click')
    expect(approval.emitted('allow')?.[0]).toEqual([{ remember: true }])
  })

  it('filters records and selects command search results', async () => {
    const columns = [{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }]
    const rows = [{ id: 'one', name: 'Build', status: 'running' }, { id: 'two', name: 'Docs', status: 'completed' }]
    const table = mount(AgentFilterTable, {
      props: { columns, rows, filter: 'all', filters: [{ label: 'Running', value: 'running' }] },
    })
    expect(table.findAll('[role="row"]')[1]!.attributes('hover-class')).toBe('bg-[var(--varo-agent-surface-strong)]')
    await table.get('[role="navigation"] button').trigger('click')
    expect(table.emitted('update:filter')?.[0]).toEqual(['running'])

    const search = mount(AgentCommandSearch, {
      props: { items: [{ id: 'release', label: 'Generate release plan' }], modelValue: '' },
    })
    expect(search.get('div button').attributes('hover-class')).toBe('bg-[var(--varo-agent-surface-strong)]')
    await search.get('input').setValue('release')
    expect(search.emitted('update:modelValue')?.at(-1)).toEqual(['release'])
    await search.get('div button').trigger('click')
    expect(search.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'release' })
  })

  it('emits workflow and fine-tune edits', async () => {
    const flow = mount(AgentFlowchart, {
      props: { nodes: [{ id: 'trigger', label: 'Requested', type: 'trigger' }] },
    })
    await flow.get('.agent-flowchart__node').trigger('click')
    expect(flow.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'trigger' })

    const tune = mount(AgentFineTune, {
      props: {
        controls: [
          { label: 'Width', type: 'number', value: 320 },
          {
            label: 'Tone',
            type: 'select',
            value: 'neutral',
            values: [
              { label: 'Neutral', value: 'neutral' },
              { label: 'Expressive', value: 'expressive' },
            ],
          },
        ],
      },
    })
    await tune.get('input').setValue('360')
    expect(tune.emitted('update:controls')?.at(-1)?.[0]).toEqual([
      { label: 'Width', type: 'number', value: 360 },
      {
        label: 'Tone',
        type: 'select',
        value: 'neutral',
        values: [
          { label: 'Neutral', value: 'neutral' },
          { label: 'Expressive', value: 'expressive' },
        ],
      },
    ])
    expect(tune.find('picker').exists()).toBe(false)
    const toneChoices = tune.findAll('[role="radio"]')
    expect(toneChoices).toHaveLength(2)
    expect(toneChoices[0]!.attributes('aria-checked')).toBe('true')
    await toneChoices[1]!.trigger('click')
    const latestControls = tune.emitted('update:controls')?.at(-1)?.[0] as AgentFineTuneControl[] | undefined
    expect(latestControls?.[1]).toMatchObject({ label: 'Tone', value: 'expressive' })
  })

  it('emits message, code, and tool-result actions', async () => {
    const scroller = mount(AgentMessageScroller, {
      props: { atLiveEdge: false },
      slots: { default: 'Conversation' },
    })
    await scroller.get('button').trigger('click')
    expect(scroller.emitted('update:atLiveEdge')?.[0]).toEqual([true])
    expect(scroller.emitted('follow')).toHaveLength(1)

    const code = mount(AgentCodeBlock, {
      props: { code: 'const ready = true', filename: 'agent.ts' },
    })
    await code.get('button').trigger('click')
    expect(code.emitted('copy')?.[0]).toEqual(['const ready = true'])

    const result = mount(AgentToolResult, {
      props: { name: 'pnpm test', output: 'failed', status: 'failed' },
    })
    await result.findAll('button').at(-1)!.trigger('click')
    expect(result.emitted('retry')).toHaveLength(1)
  })

  it('supports citation, sidebar, context, and insight navigation', async () => {
    const citation = { id: 'docs', title: 'Docs', domain: 'varo.dev' }
    const citations = mount(AgentCitations, {
      props: { defaultOpen: true, items: [citation] },
    })
    await citations.findAll('button')[1].trigger('click')
    expect(citations.emitted('open')?.[0]).toEqual([citation])

    const activity = mount(AgentActivity, {
      props: { items: [{ id: 'build', kind: 'tool', status: 'completed', title: 'Build' }] },
    })
    expect(activity.text()).toContain('1/1')

    const sidebarItem = { id: 'release', label: 'Release' }
    const sidebar = mount(AgentSidebar, {
      props: { groups: [{ id: 'workspace', label: 'Workspace', items: [sidebarItem] }] },
    })
    await sidebar.findAll('[role="navigation"] button')[0].trigger('click')
    expect(sidebar.emitted('select')?.[0]).toEqual([sidebarItem])

    const chunk = { content: 'Context', id: 'context', source: 'SOP.pdf' }
    const context = mount(AgentContextCard, { props: { chunks: [chunk] } })
    await context.get('button').trigger('click')
    expect(context.emitted('open')?.[0]).toEqual([chunk])

    const insight = { action: 'Inspect', description: 'Bundle improved', id: 'bundle' }
    const insights = mount(AgentInsightCard, { props: { insights: [insight] } })
    await insights.findAll('button').at(-1)!.trigger('click')
    expect(insights.emitted('action')?.[0]).toEqual([insight])
  })

  it('supports selection and data-table review actions', async () => {
    const action = { id: 'explain', label: 'Explain' }
    const selection = mount(AgentSelectionActions, {
      props: { actions: [action], text: 'selected code' },
    })
    await selection.get('button').trigger('click')
    expect(selection.emitted('select')?.[0]).toEqual([{ action, text: 'selected code' }])

    const columns = [{ key: 'name', label: 'Name', sortable: true }]
    const row = { change: 'add' as const, id: 'one', name: 'AgentThinking' }
    const diffTable = mount(AgentDiffTable, { props: { columns, rows: [row] } })
    await diffTable.get('[data-change="add"]').trigger('click')
    expect(diffTable.emitted('select')?.[0]).toEqual([row])
    await diffTable.findAll('button').at(-1)!.trigger('click')
    expect(diffTable.emitted('accept')).toHaveLength(1)

    const records = mount(AgentRecordsTable, { props: { columns, rows: [row] } })
    await records.findAll('button')[0].trigger('click')
    expect(records.emitted('sort')?.[0]).toEqual([columns[0]])
    await records.findAll('button')[1].trigger('click')
    expect(records.emitted('select')?.[0]).toEqual([row])
  })
})
