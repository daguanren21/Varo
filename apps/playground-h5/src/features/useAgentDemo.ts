import type { StreamChunk } from '@tanstack/ai'
import type { ChatClientSnapshot } from '@tanstack/ai-client'
import type { AgentConversationMessage } from '../components/agent-ui/types'
import { EventType, hashSchemaInput, normalizeApprovalSchema, toolDefinition, withInterruptBinding } from '@tanstack/ai/client'
import { ChatClient, stream } from '@tanstack/ai-client'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { agentConversationHistory, agentMessageText } from '../components/agent-ui/presentation'

const releaseTool = toolDefinition({ name: 'local.release.preview', description: '仅演示发布授权，不发布任何包。', needsApproval: true }).client()
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

export function useAgentDemo() {
  const prompt = shallowRef('')
  const lastPrompt = shallowRef('分析双端 Agent 方案')
  let disposed = false
  const createClient = (threadId: string, welcome = false) => new ChatClient({
    threadId,
    tools: [releaseTool],
    initialMessages: welcome ? [{ id: 'welcome', role: 'assistant', parts: [{ type: 'text', content: '你好，我是 Varo Agent。试试“分析双端方案”或“生成发布计划”。' }] }] : [],
    connection: stream(async function* (history, _data, signal, input): AsyncGenerator<StreamChunk> {
      const id = `assistant-${input.runId}`
      yield { type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId }
      yield { type: EventType.TEXT_MESSAGE_START, messageId: id, role: 'assistant' }
      if (input.resume?.length) {
        const resolution = input.resume[0]!
        const approved = resolution.payload === true || (typeof resolution.payload === 'object' && resolution.payload !== null && 'approved' in resolution.payload && resolution.payload.approved === true)
        yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId: id, delta: approved ? '已记录本地发布授权；演示不会发布包或访问 npm registry。' : '已取消发布动作，未产生任何外部副作用。' }
        yield { type: EventType.TOOL_CALL_RESULT, messageId: `result-${resolution.interruptId}`, toolCallId: resolution.interruptId, content: JSON.stringify({ approved, local: true }), role: 'tool' }
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
          yield { type: 'TOOL_CALL_START', toolCallId, toolCallName: releaseTool.name, parentMessageId: id }
          yield { type: EventType.TOOL_CALL_ARGS, toolCallId, delta: '{}' }
          yield { type: 'TOOL_CALL_END', toolCallId }
          yield { type: EventType.TEXT_MESSAGE_END, messageId: id }
          yield {
            type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId,
            outcome: { type: 'interrupt', interrupts: [withInterruptBinding({ id: toolCallId, toolCallId, reason: 'tool_call', message: '是否批准本地发布演示？不会执行真实发布。', responseSchema: releaseApproval.responseSchema, metadata: { kind: 'approval', toolName: releaseTool.name, input: {} } }, { v: 1, kind: 'tool-approval', interruptId: toolCallId, interruptedRunId: input.runId, generation: 0, toolName: releaseTool.name, toolCallId, originalArgs: {}, inputSchemaHash: hashSchemaInput(releaseTool.inputSchema), approvalSchemaHash: releaseApproval.approvalSchemaHash, responseSchemaHash: releaseApproval.responseSchemaHash })] },
          }
          return
        }
      }
      yield { type: EventType.TEXT_MESSAGE_END, messageId: id }
      yield { type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId }
    }),
  })
  let threadSequence = 0
  let client = createClient(`varo-agent-demo-${++threadSequence}`, true)
  const snapshot = shallowRef<ChatClientSnapshot>(client.getSnapshot())
  let unsubscribe = client.subscribeSnapshot(() => { snapshot.value = client.getSnapshot() })
  const busy = computed(() => snapshot.value.isLoading || snapshot.value.interruptState.interrupts.length > 0 || snapshot.value.interruptState.resuming)
  const messages = computed<AgentConversationMessage[]>(() => agentConversationHistory(snapshot.value, '刚刚'))

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
    if (interrupt?.kind === 'tool-approval' && interrupt.canResolve) { interrupt.resolveInterrupt(true) }
  }
  function reject(id: string) {
    const interrupt = client.getInterrupts().find(item => item.id === id)
    if (interrupt?.kind === 'tool-approval' && interrupt.canResolve) { interrupt.resolveInterrupt(false) }
  }
  function retry() {
    if (!busy.value && !disposed && lastPrompt.value) { void client.reload() }
  }
  onBeforeUnmount(() => {
    disposed = true
    client.stop()
    unsubscribe()
    client.detach()
    client.dispose()
  })
  return { approve, busy, messages, newConversation, prompt, reject, retry, send, snapshot, stop }
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
