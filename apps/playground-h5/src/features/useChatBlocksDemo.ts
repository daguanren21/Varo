import type { StreamChunk } from '@tanstack/ai'
import type { ChatClientSnapshot, UIMessage } from '@tanstack/ai-client'
import { EventType } from '@tanstack/ai/client'
import { ChatClient, stream } from '@tanstack/ai-client'
import type { AgentConversationMessage } from '../components/agent-ui/types'
import type { AgentAssistantContext, AgentAssistantResponse } from '../components/blocks/agent-assistant-sheet.types'
import type { AgentChatHistoryItem } from '../components/blocks/agent-chat.types'
import { agentConversationHistory, agentCurrentMessage, agentMessageText } from '../components/agent-ui/presentation'
import { computed, onBeforeUnmount, shallowRef } from 'vue'

const passage = '把复杂任务拆成可以确认的小步骤，保留用户的决定权。'
const response = '建议草稿：先说明目标，再列出可验证的步骤。每一步由用户确认，助手只提供建议，不替用户执行外部操作。'

export function useChatBlocksDemo() {
  const connection = stream(async function* (_messages, data, signal, input): AsyncGenerator<StreamChunk> {
    if (data?.fail) { throw new Error('演示错误：请重试本地生成。') }
    const id = `response-${input.runId}`
    const answer = String(data?.answer ?? response)
    yield { type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId }
    yield { type: EventType.TEXT_MESSAGE_START, messageId: id, role: 'assistant' }
    for (let offset = 0; offset < answer.length; offset += 8) {
      await delay(120, signal)
      if (signal?.aborted) { return }
      chunksProduced.value += 1
      yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId: id, delta: answer.slice(offset, offset + 8) }
    }
    yield { type: EventType.TEXT_MESSAGE_END, messageId: id }
    yield { type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId }
  })
  let sequence = 0
  let threadId = `thread-${++sequence}`
  let client = new ChatClient({ threadId, connection })
  const snapshot = shallowRef<ChatClientSnapshot>(client.getSnapshot())
  const messages = computed<AgentConversationMessage[]>(() => agentConversationHistory(snapshot.value))
  const history = shallowRef<AgentChatHistoryItem[]>([{ id: 'saved', title: '已保存的写作建议' }])
  const conversations = new Map<string, ReadonlyArray<UIMessage>>([
    ['saved', [{ id: 'saved-answer', role: 'assistant', parts: [{ type: 'text', content: '先写清楚目标，再说明下一步。' }] }]],
  ])
  const activeHistoryId = shallowRef('')
  const prompt = shallowRef('')
  const draft = shallowRef('我的草稿：')
  const context = shallowRef<AgentAssistantContext>()
  const open = shallowRef(false)
  const chatVisible = shallowRef(true)
  const expanded = shallowRef(false)
  const disabled = shallowRef(false)
  const layout = shallowRef<'panel' | 'page'>('panel')
  const lastAction = shallowRef('ready')
  const chunksProduced = shallowRef(0)
  const insertCount = shallowRef(0)
  const busy = computed(() => snapshot.value.isLoading)
  const selectedResponse = computed<AgentAssistantResponse | undefined>(() => {
    const message = agentCurrentMessage(snapshot.value)
    if (!busy.value && !snapshot.value.error && message && agentMessageText(message)) { return { id: message.id, content: agentMessageText(message) } }
    return undefined
  })
  const diagnostic = computed(() => `status=${snapshot.value.status};chunks=${chunksProduced.value};history=${activeHistoryId.value || 'new'};context=${context.value?.id ?? 'none'};open=${open.value};expanded=${expanded.value};inserts=${insertCount.value};action=${lastAction.value}`)
  let unsubscribe = client.subscribeSnapshot(() => { snapshot.value = client.getSnapshot() })
  let disposed = false
  let lastPrompt = ''


  function stop() {
    if (!busy.value) { return }
    client.stop()
    lastAction.value = 'stopped'
  }

  function archive() {
    if (activeHistoryId.value) { conversations.set(activeHistoryId.value, snapshot.value.messages) }
  }

  function selectThread(id: string, initialMessages: ReadonlyArray<UIMessage> = []) {
    unsubscribe()
    client.stop()
    client.dispose()
    threadId = id
    client = new ChatClient({ threadId, connection, initialMessages: [...initialMessages] })
    snapshot.value = client.getSnapshot()
    unsubscribe = client.subscribeSnapshot(() => { snapshot.value = client.getSnapshot() })
  }

  function send(value: string) {
    const request = value.trim()
    if (!request || busy.value || disabled.value || disposed) { return }
    archive()
    if (!activeHistoryId.value) {
      activeHistoryId.value = threadId
      history.value = [...history.value, { id: activeHistoryId.value, title: request }]
    }
    prompt.value = ''
    lastPrompt = request
    lastAction.value = 'sent'
    chunksProduced.value = 0
    const answer = context.value ? `引用「${context.value.label}」：${context.value.text}\n\n${response}` : response
    void client.sendMessage(request, { answer })
  }

  function selectHistory(id: string) {
    if (busy.value || disabled.value || id === activeHistoryId.value || !conversations.has(id)) { return }
    archive()
    selectThread(id, conversations.get(id)!)
    activeHistoryId.value = id
    prompt.value = ''
    lastAction.value = `history:${id}`
  }

  function newConversation() {
    if (busy.value || disabled.value) { return }
    archive()
    selectThread(`thread-${++sequence}`)
    activeHistoryId.value = ''
    prompt.value = ''
    lastAction.value = 'new-conversation'
  }

  function quote(long = false) {
    if (disabled.value) { return }
    context.value = { id: long ? 'long-passage' : 'passage', label: long ? '长段落' : '选定段落', text: long ? passage.repeat(30) : passage }
    open.value = true
    lastAction.value = 'quoted'
  }

  function removeContext() {
    context.value = undefined
    lastAction.value = 'context-removed'
  }

  function insert(value: AgentAssistantResponse) {
    if (disabled.value || busy.value) { return }
    draft.value = `${draft.value}\n${value.content}`
    insertCount.value += 1
    lastAction.value = `inserted:${value.id}`
  }

  function close() {
    stop()
    open.value = false
    lastAction.value = 'closed'
  }

  function closeChat() {
    close()
    chatVisible.value = false
  }

  function fail() {
    if (disabled.value) { return }
    stop()
    archive()
    void client.sendMessage(lastPrompt || '演示错误', { fail: true })
    lastAction.value = 'failed'
  }

  function retry() { send(lastPrompt || '重试写作建议') }

  function dispose() {
    if (disposed) { return }
    disposed = true
    client.stop()
    unsubscribe()
    client.detach()
    client.dispose()
  }
  onBeforeUnmount(dispose)

  return { activeHistoryId, busy, chatVisible, close, closeChat, context, diagnostic, disabled, draft, expanded, fail, history, insert, layout, messages, newConversation, open, prompt, quote, removeContext, retry, selectedResponse, selectHistory, send, snapshot, stop }
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
