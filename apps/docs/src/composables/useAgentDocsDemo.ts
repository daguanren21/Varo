import type { StreamChunk } from '@tanstack/ai'
import type { ChatClientSnapshot } from '@tanstack/ai-client'
import type { AgentConversationMessage } from '../components/agent-ui/types'
import { EventType, hashSchemaInput, normalizeApprovalSchema, toolDefinition, withInterruptBinding } from '@tanstack/ai/client'
import { ChatClient, stream } from '@tanstack/ai-client'
import { computed, onBeforeUnmount, onMounted, shallowRef, useId } from 'vue'
import { agentConversationHistory, agentMessageText } from '../components/agent-ui/presentation'

function sleep(duration: number, signal?: AbortSignal) {
  let resolve!: () => void
  const promise = new Promise<void>(done => { resolve = done })
  if (signal?.aborted) { resolve(); return promise }
  const finish = () => {
    clearTimeout(timer)
    signal?.removeEventListener('abort', finish)
    resolve()
  }
  const timer = setTimeout(finish, duration)
  signal?.addEventListener('abort', finish, { once: true })
  return promise
}

const releaseTool = toolDefinition({
  name: 'local.docs.release-preview',
  description: '本地审批展示；不执行检查、构建或发布。',
  needsApproval: true,
}).client()
const releaseApproval = normalizeApprovalSchema(releaseTool.approvalSchema, releaseTool.inputSchema)

const RESPONSE = `## 本地双端 Agent 展示

此演示通过 **TanStack ChatClient** 消费标准 AG-UI 分片，不调用模型或外部服务，也不证明平台检查已通过。

| 层级 | H5 | Weapp |
| --- | --- | --- |
| 聊天状态 | ChatClientSnapshot | ChatClientSnapshot |
| 响应式运行时 | Vue | Wevu |
| Markdown 展示 | 安全 AST | 原生节点树 |

\`AgentEventRenderer\` 只展示 SDK 快照，审批决定由应用按 interrupt ID 提交给 SDK。`

export function useAgentDocsDemo(initialPrompt = '分析双端 Agent 能力') {
  const prompt = shallowRef('')
  const lastPrompt = shallowRef(initialPrompt)
  let disposed = false
  const identity = `docs-${useId()}`
  const createClient = (threadId: string, welcome = false) => new ChatClient({
    threadId,
    tools: [releaseTool],
    initialMessages: welcome ? [{
      id: 'welcome',
      role: 'assistant',
      parts: [{ type: 'text', content: 'Varo Agent UI 本地文档演示：标准 AG-UI 增量数据，不连接模型或执行外部操作。' }],
    }] : [],
    connection: stream(async function* (history, _data, signal, input): AsyncGenerator<StreamChunk> {
      const messageId = `assistant-${input.runId}`
      yield { type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId }
      yield { type: EventType.TEXT_MESSAGE_START, messageId, role: 'assistant' }

      if (input.resume?.length) {
        const resolution = input.resume[0]!
        const approved = resolution.payload === true || (typeof resolution.payload === 'object' && resolution.payload !== null && 'approved' in resolution.payload && resolution.payload.approved === true)
        yield {
          type: EventType.TEXT_MESSAGE_CONTENT,
          messageId,
          delta: approved ? '已记录本地审批决定；未执行任何检查、构建或发布。' : '已拒绝本地演示操作，没有产生外部副作用。',
        }
      }
      else {
        const message = history[history.length - 1]
        const request = message && 'parts' in message ? agentMessageText(message) : String(message?.content ?? '')
        const reasoningId = `reasoning-${input.runId}`
        yield { type: EventType.REASONING_MESSAGE_START, messageId: reasoningId, role: 'reasoning' }
        await sleep(160, signal)
        if (signal?.aborted) { return }
        yield { type: EventType.REASONING_MESSAGE_CONTENT, messageId: reasoningId, delta: `本地整理“${request}”的展示步骤；不是模型推理。` }
        yield { type: EventType.REASONING_MESSAGE_END, messageId: reasoningId }

        const inspectId = `inspect-${input.runId}`
        yield { type: 'TOOL_CALL_START', toolCallId: inspectId, toolCallName: 'local.docs.preview', parentMessageId: messageId }
        yield { type: EventType.TOOL_CALL_ARGS, toolCallId: inspectId, delta: '{}' }
        await sleep(180, signal)
        if (signal?.aborted) { return }
        yield { type: 'TOOL_CALL_END', toolCallId: inspectId }
        yield { type: EventType.TOOL_CALL_RESULT, toolCallId: inspectId, messageId: `result-${inspectId}`, content: '本地工具结果展示；未扫描 Registry 或验证平台。' }

        const needsApproval = /发布|release/i.test(request)
        const content = needsApproval ? `${RESPONSE}\n\n### 本地发布计划\n\n以下审批仅演示 SDK 中断，不执行发布。` : RESPONSE
        for (let offset = 0; offset < content.length; offset += 10) {
          await sleep(34, signal)
          if (signal?.aborted) { return }
          yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta: content.slice(offset, offset + 10) }
        }

        if (needsApproval) {
          const toolCallId = `release-${input.runId}`
          yield { type: 'TOOL_CALL_START', toolCallId, toolCallName: releaseTool.name, parentMessageId: messageId }
          yield { type: EventType.TOOL_CALL_ARGS, toolCallId, delta: '{}' }
          yield { type: 'TOOL_CALL_END', toolCallId }
          yield { type: EventType.TEXT_MESSAGE_END, messageId }
          yield {
            type: EventType.RUN_FINISHED,
            threadId: input.threadId,
            runId: input.runId,
            outcome: {
              type: 'interrupt',
              interrupts: [withInterruptBinding({
                id: toolCallId,
                toolCallId,
                reason: 'tool_call',
                message: '是否批准本地发布计划展示？不会执行检查、构建或发布。',
                responseSchema: releaseApproval.responseSchema,
                metadata: { kind: 'approval', toolName: releaseTool.name, input: {} },
              }, {
                v: 1,
                kind: 'tool-approval',
                interruptId: toolCallId,
                interruptedRunId: input.runId,
                generation: 0,
                toolName: releaseTool.name,
                toolCallId,
                originalArgs: {},
                inputSchemaHash: hashSchemaInput(releaseTool.inputSchema),
                approvalSchemaHash: releaseApproval.approvalSchemaHash,
                responseSchemaHash: releaseApproval.responseSchemaHash,
              })],
            },
          }
          return
        }
      }

      yield { type: EventType.TEXT_MESSAGE_END, messageId }
      yield { type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId }
    }),
  })
  let threadSequence = 0
  let client = createClient(`${identity}-${++threadSequence}`, true)
  const snapshot = shallowRef<ChatClientSnapshot>(client.getSnapshot())
  let unsubscribe = client.subscribeSnapshot(() => { snapshot.value = client.getSnapshot() })
  const busy = computed(() => snapshot.value.isLoading || snapshot.value.interruptState.resuming || snapshot.value.interruptState.interrupts.some(interrupt => interrupt.status === 'pending'))
  const messages = computed<AgentConversationMessage[]>(() => agentConversationHistory(snapshot.value, 'Now'))

  function run(value = prompt.value) {
    const request = value.trim()
    if (!request || busy.value || disposed) { return }
    prompt.value = ''
    lastPrompt.value = request
    void client.sendMessage(request)
  }
  function approve(id: string) {
    const interrupt = client.getInterrupts().find(item => item.id === id)
    if (disposed || snapshot.value.interruptState.resuming || interrupt?.kind !== 'tool-approval' || !interrupt.canResolve) { return false }
    interrupt.resolveInterrupt(true)
    return true
  }
  function reject(id: string) {
    const interrupt = client.getInterrupts().find(item => item.id === id)
    if (disposed || snapshot.value.interruptState.resuming || interrupt?.kind !== 'tool-approval' || !interrupt.canResolve) { return false }
    interrupt.resolveInterrupt(false)
    return true
  }
  function retry() {
    if (!busy.value && !disposed && lastPrompt.value) { void client.reload() }
  }
  function stop() { client.stop() }
  function newConversation() {
    if (disposed) { return }
    unsubscribe()
    client.stop()
    client.dispose()
    client = createClient(`${identity}-${++threadSequence}`)
    snapshot.value = client.getSnapshot()
    unsubscribe = client.subscribeSnapshot(() => { snapshot.value = client.getSnapshot() })
    prompt.value = ''
    lastPrompt.value = ''
  }

  onMounted(() => {
    client.attach()
    run(initialPrompt)
  })
  onBeforeUnmount(() => {
    disposed = true
    client.stop()
    unsubscribe()
    client.detach()
    client.dispose()
  })

  return { approve, busy, messages, newConversation, prompt, reject, retry, run, snapshot, stop }
}
