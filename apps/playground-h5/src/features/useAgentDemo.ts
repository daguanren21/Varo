import type { StreamChunk } from '@tanstack/ai'
import type { ChatClientSnapshot, UIMessage } from '@tanstack/ai-client'
import type { ComputedRef, ShallowRef } from 'vue'
import { EventType, hashSchemaInput, normalizeApprovalSchema, toolDefinition, withInterruptBinding } from '@tanstack/ai/client'
import { ChatClient, stream } from '@tanstack/ai-client'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { agentCanResolveApproval, agentConversationHistory, agentMessageText, agentSnapshotProjection } from '../components/agent-ui/presentation'

const releaseTool = toolDefinition({ name: 'local.release.preview', description: '仅演示发布授权，不发布任何包。', needsApproval: true }).client()
export type AgentDemoSnapshot = ChatClientSnapshot<Array<typeof releaseTool>, any>
const releaseApproval = normalizeApprovalSchema(releaseTool.approvalSchema, releaseTool.inputSchema)
const DEMO_RESPONSE = `## 双端 Agent 交付建议

本地演示通过 **TanStack ChatClient** 消费标准 AG-UI 分片；不连接模型或外部服务。

| 层级 | H5 | 小程序 |
| --- | --- | --- |
| 状态 | ChatClientSnapshot | ChatClientSnapshot |
| 运行时 | Vue | Wevu |
| 内容 | 安全 Markdown | WXML 节点树 |

\`AgentEventRenderer\` 只呈现 SDK 快照，审批决定由应用提交给 SDK。

\`\`\`ts
const client = new ChatClient({ threadId: 'demo', connection: stream(localDemo) })
await client.sendMessage(prompt)
\`\`\`

> 这是确定性的本地演示，不是模型回答。`

export interface AgentDemoController {
  approve: (id: string) => void
  busy: ComputedRef<boolean>
  cancelInterrupts: () => void
  messages: ComputedRef<UIMessage[]>
  newConversation: () => void
  prompt: ShallowRef<string>
  reject: (id: string) => void
  retry: () => void
  retryInterrupts: () => void
  send: (value?: string) => void
  snapshot: ShallowRef<AgentDemoSnapshot>
  stop: () => void
}

export function useAgentDemo(): AgentDemoController {
  const prompt = shallowRef('')
  const lastPrompt = shallowRef('分析双端 Agent 方案')
  let disposed = false
  const createClient = (threadId: string, welcome = false) => {
    let pending: { interruptId: string, toolCallId: string, runId: string } | undefined
    return new ChatClient({
    threadId,
    tools: [releaseTool],
    initialMessages: welcome ? [{ id: 'welcome', role: 'assistant', parts: [{ type: 'text', content: '你好，我是 Varo Agent。试试“分析双端方案”或“生成发布计划”。' }] }] : [],
    connection: stream(async function* (history, _data, signal, input): AsyncGenerator<StreamChunk> {
      const id = `assistant-${input.runId}`
      yield { type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId }
      yield { type: EventType.TEXT_MESSAGE_START, messageId: id, role: 'assistant' }
      if (input.resume?.length) {
        const resolution = input.resume[0]!
        if (!pending || input.resume.length !== 1 || resolution.interruptId !== pending.interruptId || input.threadId !== threadId || input.parentRunId !== pending.runId) { throw new Error('本地发布审批已失效') }
        const { toolCallId } = pending
        const approved = resolution.payload === true || (typeof resolution.payload === 'object' && resolution.payload !== null && 'approved' in resolution.payload && resolution.payload.approved === true)
        yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId: id, delta: approved ? '已记录本地发布授权；演示不会发布包或访问 npm registry。' : '已取消发布动作，未产生任何外部副作用。' }
        yield { type: EventType.TOOL_CALL_RESULT, messageId: `result-${toolCallId}`, toolCallId, content: JSON.stringify({ approved, local: true }), role: 'tool', ...(!approved ? { metadata: { tanstack: { toolResultOutcome: resolution.status === 'cancelled' ? 'cancelled' : 'denied' } } } : {}) }
        pending = undefined
      }
      else {
        const request = history[history.length - 1]
        const text = request && 'parts' in request ? agentMessageText(request) : String(request?.content ?? '')
        yield { type: EventType.REASONING_MESSAGE_START, messageId: `reasoning-${id}`, role: 'reasoning' }
        yield { type: EventType.REASONING_MESSAGE_CONTENT, messageId: `reasoning-${id}`, delta: `本地整理“${text}”的组件、SDK 与发布边界。` }
        yield { type: EventType.REASONING_MESSAGE_END, messageId: `reasoning-${id}` }
        for (let offset = 0; offset < DEMO_RESPONSE.length; offset += 12) {
          await delay(42, signal)
          if (signal?.aborted) { return }
          yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId: id, delta: DEMO_RESPONSE.slice(offset, offset + 12) }
        }
        if (text.includes('发布')) {
          const toolCallId = `release-${input.runId}`
          const interruptId = `approval-${input.runId}`
          pending = { interruptId, toolCallId, runId: input.runId }
          yield { type: 'TOOL_CALL_START', toolCallId, toolCallName: releaseTool.name, parentMessageId: id }
          yield { type: EventType.TOOL_CALL_ARGS, toolCallId, delta: '{}' }
          yield { type: 'TOOL_CALL_END', toolCallId }
          yield { type: EventType.TEXT_MESSAGE_END, messageId: id }
          yield {
            type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId,
            outcome: { type: 'interrupt', interrupts: [withInterruptBinding({ id: interruptId, toolCallId, reason: 'tool_call', message: '是否批准本地发布演示？不会执行真实发布。', responseSchema: releaseApproval.responseSchema, metadata: { kind: 'approval', toolName: releaseTool.name, input: {} } }, { v: 1, kind: 'tool-approval', interruptId, interruptedRunId: pending.runId, generation: 0, toolName: releaseTool.name, toolCallId, originalArgs: {}, inputSchemaHash: hashSchemaInput(releaseTool.inputSchema), approvalSchemaHash: releaseApproval.approvalSchemaHash, responseSchemaHash: releaseApproval.responseSchemaHash })] },
          }
          return
        }
      }
      yield { type: EventType.TEXT_MESSAGE_END, messageId: id }
      yield { type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId }
    }),
  })
  }
  let threadSequence = 0
  let client = createClient(`varo-agent-demo-${++threadSequence}`, true)
  const snapshot = shallowRef<AgentDemoSnapshot>(client.getSnapshot())
  let unsubscribe = client.subscribeSnapshot(() => { snapshot.value = client.getSnapshot() })
  const busy = computed(() => snapshot.value.isLoading || snapshot.value.interruptState.interrupts.length > 0 || snapshot.value.interruptState.interruptErrors.length > 0 || snapshot.value.interruptState.resuming)
  const messages = computed<UIMessage[]>(() => agentConversationHistory(snapshot.value))

  function stop() { client.stop() }
  function newConversation() {
    if (disposed) { return }
    unsubscribe()
    client.stop()
    client.dispose()
    client = createClient(`varo-agent-demo-${++threadSequence}`)
    snapshot.value = client.getSnapshot()
    unsubscribe = client.subscribeSnapshot(() => { snapshot.value = client.getSnapshot() })
    prompt.value = ''
    lastPrompt.value = ''
  }
  function send(value = prompt.value) {
    const request = value.trim()
    if (!request || busy.value || disposed) { return }
    prompt.value = ''
    lastPrompt.value = request
    void client.sendMessage(request)
  }
  function approve(id: string) {
    const interrupt = client.getInterrupts().find(item => item.id === id)
    if (!disposed && interrupt?.kind === 'tool-approval' && agentCanResolveApproval(client.getSnapshot(), interrupt)) { interrupt.resolveInterrupt(true) }
  }
  function reject(id: string) {
    const interrupt = client.getInterrupts().find(item => item.id === id)
    if (!disposed && interrupt?.kind === 'tool-approval' && agentCanResolveApproval(client.getSnapshot(), interrupt)) { interrupt.resolveInterrupt(false) }
  }
  function retry() {
    if (!busy.value && !disposed && lastPrompt.value) { void client.reload() }
  }
  function retryInterrupts() {
    if (!disposed && agentSnapshotProjection(client.getSnapshot()).canRetryInterrupts) { client.retryInterrupts() }
  }
  function cancelInterrupts() {
    if (!disposed && agentSnapshotProjection(client.getSnapshot()).canCancelInterrupts) { client.cancelInterrupts() }
  }
  onBeforeUnmount(() => {
    disposed = true
    client.stop()
    unsubscribe()
    client.detach()
    client.dispose()
  })
  return { approve, busy, cancelInterrupts, messages, newConversation, prompt, reject, retry, retryInterrupts, send, snapshot, stop }
}

function delay(duration: number, signal?: AbortSignal) {
  let resolve!: () => void
  const promise = new Promise<void>(done => { resolve = done })
  if (signal?.aborted) { resolve(); return promise }
  const finish = () => { clearTimeout(timer); signal?.removeEventListener('abort', finish); resolve() }
  const timer = setTimeout(finish, duration)
  signal?.addEventListener('abort', finish, { once: true })
  return promise
}
