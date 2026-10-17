import type { AgentConversationMessage } from '../../components/agent-ui/types'
import type { AgentAssistantContext, AgentAssistantResponse } from '../../components/blocks/agent-assistant-sheet.types'
import type { AgentChatHistoryItem } from '../../components/blocks/agent-chat.types'
import { createAgentStreamController } from '@varo-ui/ai'
import { computed, onUnload, onUnmounted, shallowRef } from 'wevu'

const passage = '把复杂任务拆成可以确认的小步骤，保留用户的决定权。'
const response = '建议草稿：先说明目标，再列出可验证的步骤。每一步由用户确认，助手只提供建议，不替用户执行外部操作。'

export function useChatBlocksDemo() {
  const controller = createAgentStreamController({ text: { maxCharsPerCommit: 12, maxCharsPerSecond: 120, minCharsPerSecond: 60 } })
  const snapshot = shallowRef(controller.getSnapshot())
  const messages = shallowRef<AgentConversationMessage[]>([])
  const history = shallowRef<AgentChatHistoryItem[]>([{ id: 'saved', title: '已保存的写作建议' }])
  const conversations = new Map<string, AgentConversationMessage[]>([
    ['saved', [{ id: 'saved-answer', role: 'assistant', content: '先写清楚目标，再说明下一步。' }]],
  ])
  const activeHistoryId = shallowRef('')
  const prompt = shallowRef('')
  const draft = shallowRef('我的草稿：')
  const context = shallowRef<AgentAssistantContext | undefined>(undefined)
  const open = shallowRef(false)
  const chatVisible = shallowRef(true)
  const expanded = shallowRef(false)
  const disabled = shallowRef(false)
  const layout = shallowRef<'panel' | 'page'>('panel')
  const disabledLabel = computed(() => disabled.value ? '启用输入' : '禁用输入')
  const lastAction = shallowRef('ready')
  const chunksProduced = shallowRef(0)
  const insertCount = shallowRef(0)
  const busy = computed(() => snapshot.value.status === 'streaming' || snapshot.value.status === 'waiting')
  const selectedResponse = computed<AgentAssistantResponse | undefined>(() => {
    const message = snapshot.value.message
    if (snapshot.value.status === 'completed' && message?.final) { return { id: message.id, content: message.source } }
    if (snapshot.value.status !== 'idle') { return undefined }
    for (let index = messages.value.length - 1; index >= 0; index--) {
      const saved = messages.value[index]
      if (saved.role === 'assistant') { return { id: saved.id, content: saved.content } }
    }
    return undefined
  })
  const diagnostic = computed(() => `status=${snapshot.value.status};chunks=${chunksProduced.value};history=${activeHistoryId.value || 'new'};context=${context.value?.id ?? 'none'};open=${open.value};expanded=${expanded.value};inserts=${insertCount.value};action=${lastAction.value}`)
  const unsubscribe = controller.subscribe(() => { snapshot.value = controller.getSnapshot() })
  let timer: number | NodeJS.Timeout | undefined
  let sequence = 0
  let disposed = false
  let lastPrompt = ''

  function clearProducer() {
    clearTimeout(timer)
    timer = undefined
  }

  function stop() {
    if (!busy.value) { return }
    clearProducer()
    controller.cancel('已停止生成')
    lastAction.value = 'stopped'
  }

  function archive() {
    const message = snapshot.value.message
    if (message?.source) {
      messages.value = [...messages.value, { id: message.id, role: 'assistant', content: message.source }]
    }
    if (activeHistoryId.value) { conversations.set(activeHistoryId.value, messages.value) }
  }

  function send(value: string) {
    const request = value.trim()
    if (!request || busy.value || disabled.value || disposed) { return }
    archive()
    controller.reset()
    const id = `response-${++sequence}`
    if (!activeHistoryId.value) {
      activeHistoryId.value = `thread-${sequence}`
      history.value = [...history.value, { id: activeHistoryId.value, title: request }]
    }
    messages.value = [...messages.value, { id: `prompt-${sequence}`, role: 'user', content: request }]
    prompt.value = ''
    lastPrompt = request
    lastAction.value = 'sent'
    chunksProduced.value = 0
    controller.push({ type: 'message.start', messageId: id, role: 'assistant' })
    const answer = context.value ? `引用「${context.value.label}」：${context.value.text}\n\n${response}` : response
    let offset = 0
    function produce() {
      timer = undefined
      if (disposed || !busy.value) { return }
      controller.push({ type: 'text.delta', messageId: id, delta: answer.slice(offset, offset + 8) })
      offset += 8
      chunksProduced.value += 1
      if (offset >= answer.length) {
        controller.push({ type: 'message.end', messageId: id })
        controller.push({ type: 'done' })
      }
      else { timer = setTimeout(produce, 120) }
    }
    timer = setTimeout(produce, 120)
  }

  function selectHistory(id: string) {
    if (busy.value || disabled.value || id === activeHistoryId.value || !conversations.has(id)) { return }
    archive()
    controller.reset()
    messages.value = conversations.get(id)!
    activeHistoryId.value = id
    prompt.value = ''
    lastAction.value = `history:${id}`
  }

  function newConversation() {
    if (busy.value || disabled.value) { return }
    archive()
    controller.reset()
    messages.value = []
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
    controller.reset()
    controller.push({ type: 'error', code: 'demo-failure', message: '演示错误：请重试本地生成。', retryable: true })
    lastAction.value = 'failed'
  }

  function retry() { send(lastPrompt || '重试写作建议') }

  function dispose() {
    if (disposed) { return }
    disposed = true
    clearProducer()
    unsubscribe()
    controller.destroy()
  }
  onUnload(dispose)
  onUnmounted(dispose)

  return { activeHistoryId, busy, chatVisible, close, closeChat, context, diagnostic, disabled, disabledLabel, draft, expanded, fail, history, insert, layout, messages, newConversation, open, prompt, quote, removeContext, retry, selectedResponse, selectHistory, send, snapshot, stop }
}
