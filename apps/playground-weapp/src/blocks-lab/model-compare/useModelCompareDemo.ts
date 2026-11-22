import type { StreamChunk } from '@tanstack/ai'
import type { ChatClientSnapshot, UIMessage } from '@tanstack/ai-client'
import type { ChatUIInterrupt } from '@tanstack/ai-client/ui'
import type { AgentModelOption } from '../../components/agent-ui/agent-model-selector.types'
import type { AgentToolCallPreview } from '../../components/agent-ui/types'
import type { AgentCompareApprovalIntent, AgentCompareModelIntent, AgentCompareRunIntent, AgentCompareSide, AgentCompareState } from '../components/blocks/agent-model-compare.types'
import { ChatClient, stream } from '@tanstack/ai-client'
import { EventType } from '@tanstack/ai/client'
import { computed, onUnload, onUnmounted, shallowRef } from 'wevu'
import { availableModel } from '../../components/agent-ui/agent-model-selector.types'
import { agentCanResolveApproval, agentConversationHistory, agentCurrentMessage, agentSnapshotProjection } from '../../components/agent-ui/presentation'

const catalog: AgentModelOption[] = [
  { id: 'uppercase', label: '本地大写转换', available: true },
  { id: 'reverse', label: '本地逐词反转', available: true },
  { id: 'length', label: '本地逐词长度（Unicode 字符计数，不是 token 数）', available: true },
  { id: 'offline', label: '未连接的模型服务', available: false, reason: '没有服务连接' },
  { id: 'disabled', label: '应用禁用的转换', available: true, disabled: true, reason: '应用禁止选择' },
]

export function useModelCompareDemo() {
  const models = shallowRef(catalog)
  const prompt = shallowRef('alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima mike november oscar papa quebec romeo sierra tango')
  const uncontrolled = shallowRef(false)
  const rejectPrompt = shallowRef(false)
  const disabled = shallowRef(false)
  const visible = shallowRef(true)
  const ordinaryChat = shallowRef(false)
  const showMetrics = shallowRef(false)
  const catalogState = shallowRef<'ready' | 'loading' | 'error' | 'empty'>('ready')
  const loading = computed(() => catalogState.value === 'loading')
  const catalogError = computed(() => catalogState.value === 'error' ? '应用提供的目录加载错误；请恢复目录。' : '')
  const displayedModels = computed(() => catalogState.value === 'empty' ? [] : models.value)
  const boundPrompt = computed(() => uncontrolled.value ? undefined : prompt.value)
  const notice = shallowRef('本地异步计算；不是模型回答，不发起网络请求。左侧每次新比较的首次执行会故意抛出本地错误。')
  const disposed = shallowRef(false)
  let sequence = 0

  function createSide(id: AgentCompareSide, initialModel: string) {
    const modelId = shallowRef(initialModel)
    const elapsed = shallowRef<number | undefined>(undefined)
    const outcome = shallowRef<AgentCompareState['outcome']>(undefined)
    const toolCallPreviews = shallowRef<Readonly<Record<string, AgentToolCallPreview>> | undefined>(undefined)
    const exampleMessageId = `${id}-tool-example`
    const receipt = shallowRef({ steps: 0, cleanups: 0, active: false, timers: 0 })
    let lastRequest: { prompt: string, modelId: string } | undefined
    const connection = stream(async function* (_messages, data, signal, input): AsyncGenerator<StreamChunk> {
      const messageId = `${id}-${++sequence}`
      const request = String(data?.prompt ?? '')
      const selectedModel = String(data?.modelId ?? '')
      receipt.value = { ...receipt.value, steps: 0, active: true }
      try {
        yield { type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId }
        yield { type: EventType.TEXT_MESSAGE_START, messageId, role: 'assistant' }
        const words = request.split(/\s+/u)
        for (let index = 0; index < words.length; index++) {
          let resolve!: () => void
          const promise = new Promise<void>((done) => { resolve = done })
          const finish = () => {
            clearTimeout(timer)
            signal?.removeEventListener('abort', finish)
            receipt.value = { ...receipt.value, timers: 0 }
            resolve()
          }
          const timer = setTimeout(finish, id === 'left' ? 180 : 420)
          receipt.value = { ...receipt.value, timers: 1 }
          signal?.addEventListener('abort', finish, { once: true })
          if (signal?.aborted) { finish() }
          await promise
          if (signal?.aborted) { return }
          const word = words[index]!
          const transformed = selectedModel === 'uppercase' ? word.toUpperCase() : selectedModel === 'reverse' ? Array.from(word).reverse().join('') : `${word}(${Array.from(word).length})`
          receipt.value = { ...receipt.value, steps: receipt.value.steps + 1 }
          yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta: `${index ? ' ' : ''}${transformed}` }
          if (data?.failFirstAttempt) { throw new Error('左侧本地转换首次执行失败；右侧仍独立运行。') }
        }
        yield { type: EventType.TEXT_MESSAGE_END, messageId }
        yield { type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId }
      }
      finally {
        receipt.value = { ...receipt.value, cleanups: receipt.value.cleanups + 1, active: false, timers: 0 }
      }
    })
    let threadSequence = 0
    let client = new ChatClient({ threadId: `varo-native-model-compare-${id}-${++threadSequence}`, connection })
    const snapshot = shallowRef<ChatClientSnapshot>(client.getSnapshot())
    let unsubscribe = client.subscribeSnapshot(() => { snapshot.value = client.getSnapshot() })
    const toolExampleIsCurrent = computed(() => agentCurrentMessage(snapshot.value)?.id === exampleMessageId)
    const pending = computed(() => snapshot.value.isLoading || snapshot.value.interruptState.resuming || snapshot.value.interruptState.interrupts.length > 0 || snapshot.value.interruptState.interruptErrors.length > 0)
    const state = computed<AgentCompareState>(() => {
      return {
        label: id === 'left' ? '左侧' : '右侧',
        modelId: modelId.value,
        sessionId: `${id}-${threadSequence}`,
        messages: agentConversationHistory(snapshot.value),
        snapshot: snapshot.value,
        toolCallPreviews: toolCallPreviews.value,
        busy: pending.value,
        error: snapshot.value.error?.message,
        retryable: !pending.value && Boolean(lastRequest) && snapshot.value.status === 'error',
        outcome: outcome.value,
        metrics: showMetrics.value && elapsed.value != null ? { latencyMs: elapsed.value } : undefined,
      }
    })
    const lifecycle = computed(() => `steps=${receipt.value.steps};cleanups=${receipt.value.cleanups};active=${receipt.value.active};timers=${receipt.value.timers}`)
    async function start(request: string, failFirstAttempt: boolean, keepHistory = false) {
      if (pending.value || disposed.value) { return }
      const invocation = { prompt: request, modelId: modelId.value }
      lastRequest = invocation
      outcome.value = undefined
      if (!keepHistory) {
        toolCallPreviews.value = undefined
        client.clear()
      }
      elapsed.value = undefined
      const startedAt = Date.now()
      await client.sendMessage(request, { prompt: request, modelId: modelId.value, failFirstAttempt })
      if (!disposed.value && lastRequest === invocation && !outcome.value && !snapshot.value.error && receipt.value.steps === request.split(/\s+/u).length) {
        elapsed.value = Date.now() - startedAt
        outcome.value = 'completed'
      }
    }
    function stop() {
      if (!pending.value) { return }
      outcome.value = 'cancelled'
      client.stop()
    }
    function retry() {
      if (!lastRequest || pending.value || snapshot.value.status !== 'error' || lastRequest.modelId !== modelId.value) { return }
      void start(lastRequest.prompt, false)
    }
    function decide(interruptId: string, approved: boolean) {
      const interrupts: readonly ChatUIInterrupt[] = client.getInterrupts()
      const interrupt = interrupts.find(item => item.id === interruptId)
      if (!disposed.value && interrupt?.kind === 'tool-approval' && agentCanResolveApproval(client.getSnapshot(), interrupt)) { interrupt.resolveInterrupt(approved) }
    }
    function retryInterrupts() {
      if (!disposed.value && agentSnapshotProjection(client.getSnapshot()).canRetryInterrupts) { client.retryInterrupts() }
    }
    function cancelInterrupts() {
      if (!disposed.value && agentSnapshotProjection(client.getSnapshot()).canCancelInterrupts) { client.cancelInterrupts() }
    }
    function clear(initialMessages?: UIMessage[]) {
      if (disposed.value || pending.value) { return }
      lastRequest = undefined
      outcome.value = undefined
      elapsed.value = undefined
      toolCallPreviews.value = undefined
      unsubscribe()
      client.dispose()
      client = new ChatClient({ threadId: `varo-native-model-compare-${id}-${++threadSequence}`, connection, initialMessages })
      snapshot.value = client.getSnapshot()
      unsubscribe = client.subscribeSnapshot(() => { snapshot.value = client.getSnapshot() })
    }
    function loadToolExample(callId: string) {
      if (disposed.value || pending.value) { return }
      clear([{ id: exampleMessageId, role: 'assistant', parts: [
        { type: 'tool-call', id: callId, name: '本地工具示例', arguments: '{}', state: 'complete' },
      ] }])
      toolCallPreviews.value = { [callId]: { result: id === 'left' ? '左侧示例工具预览' : '右侧示例工具预览' } }
    }
    function select(value: string) {
      if (pending.value || value === modelId.value) { return }
      modelId.value = value
      clear()
    }
    function dispose() {
      client.stop()
      unsubscribe()
      client.detach()
      client.dispose()
    }
    return { state, pending, modelId, lifecycle, toolExampleIsCurrent, start, stop, retry, decide, retryInterrupts, cancelInterrupts, select, clear, loadToolExample, dispose }
  }

  const left = createSide('left', 'uppercase')
  const right = createSide('right', 'reverse')
  const leftState = left.state
  const rightState = right.state
  const leftLifecycle = left.lifecycle
  const rightLifecycle = right.lifecycle
  const busy = computed(() => left.pending.value || right.pending.value)
  const locked = computed(() => disposed.value || disabled.value || loading.value || Boolean(catalogError.value))
  const chatDisabled = computed(() => locked.value || !availableModel(displayedModels.value, left.modelId.value))
  const disabledLabel = computed(() => disabled.value ? '启用输入' : '禁用输入')
  const promptModeLabel = computed(() => uncontrolled.value ? '使用受控输入' : '使用非受控输入')
  const rejectionLabel = computed(() => rejectPrompt.value ? '接受提示词更新' : '拒绝提示词更新')
  const metricsLabel = computed(() => showMetrics.value ? '隐藏实测耗时' : '显示本地实测耗时')
  const selection = computed(() => `left=${left.modelId.value};right=${right.modelId.value}`)
  const toolExampleLabel = computed(() => left.toolExampleIsCurrent.value ? '继续左侧工具示例' : '载入工具示例')
  const toolExampleDisabled = computed(() => locked.value || busy.value
    || !availableModel(displayedModels.value, left.modelId.value) || !availableModel(displayedModels.value, right.modelId.value))

  function updatePrompt(value: string) {
    if (!locked.value && !busy.value && !uncontrolled.value && !rejectPrompt.value) { prompt.value = value }
  }
  function changeModel(intent: AgentCompareModelIntent) {
    const side = intent.side === 'left' ? left : right
    const other = intent.side === 'left' ? right : left
    if (locked.value || busy.value || intent.modelId === other.modelId.value || intent.modelId === side.modelId.value || !availableModel(displayedModels.value, intent.modelId)) { return }
    side.select(intent.modelId)
    notice.value = '应用已更换本侧模型并清空本侧旧结果；另一侧记录未改变。'
  }
  function run(intent: AgentCompareRunIntent) {
    if (locked.value || busy.value || !intent.prompt.trim() || intent.leftModelId !== left.modelId.value || intent.rightModelId !== right.modelId.value
      || intent.leftModelId === intent.rightModelId || !availableModel(displayedModels.value, intent.leftModelId) || !availableModel(displayedModels.value, intent.rightModelId)) { return }
    void left.start(intent.prompt.trim(), true)
    void right.start(intent.prompt.trim(), false)
    notice.value = '已启动两个独立本地异步转换；原提示词保留用于核对。'
  }
  function advanceToolExample() {
    if (disposed.value || toolExampleDisabled.value || ordinaryChat.value) { return }
    if (left.toolExampleIsCurrent.value) {
      void left.start('继续比较', false, true)
      notice.value = '已发送左侧后续消息，右侧工具示例保持不变。'
      return
    }
    const sharedCallId = `compare-tool-example-${++sequence}`
    left.loadToolExample(sharedCallId)
    right.loadToolExample(sharedCallId)
    notice.value = '已载入两侧工具示例。展开左侧工具，再选择继续左侧。'
  }
  function replaceLeftToolExample() {
    if (disposed.value || toolExampleDisabled.value || ordinaryChat.value) { return }
    const callId = Object.keys(left.state.value.toolCallPreviews ?? {})[0]
    if (!callId) { return }
    left.loadToolExample(callId)
    notice.value = '已更换左侧会话，沿用相同工具调用 ID。'
  }
  function retry(id: AgentCompareSide) {
    const side = id === 'left' ? left : right
    if (!locked.value && availableModel(displayedModels.value, side.modelId.value)) { side.retry() }
  }
  function approve(intent: AgentCompareApprovalIntent) {
    if (!locked.value) { (intent.side === 'left' ? left : right).decide(intent.interruptId, true) }
  }
  function reject(intent: AgentCompareApprovalIntent) {
    if (!locked.value) { (intent.side === 'left' ? left : right).decide(intent.interruptId, false) }
  }
  function retryInterrupts(id: AgentCompareSide) {
    if (!locked.value) { (id === 'left' ? left : right).retryInterrupts() }
  }
  function cancelInterrupts(id: AgentCompareSide) {
    if (!locked.value) { (id === 'left' ? left : right).cancelInterrupts() }
  }
  function stop(id: AgentCompareSide) { (id === 'left' ? left : right).stop() }
  function sendChat(value: string) {
    if (!locked.value && !busy.value && value.trim() && availableModel(displayedModels.value, left.modelId.value)) { void left.start(value.trim(), false) }
  }
  function newConversation() {
    if (locked.value || busy.value) { return }
    left.clear()
    prompt.value = ''
  }
  function toggleMode() {
    if (!busy.value) { ordinaryChat.value = !ordinaryChat.value }
  }
  function togglePromptMode() {
    if (!busy.value) { uncontrolled.value = !uncontrolled.value }
  }
  function clearPrompt() {
    if (!busy.value && !uncontrolled.value) { prompt.value = '' }
  }
  function setCatalog(value: typeof catalogState.value) {
    if (!busy.value) { catalogState.value = value }
  }
  function toggleAvailability() {
    if (busy.value) { return }
    models.value = models.value.map(model => model.id === left.modelId.value ? { ...model, available: !model.available } : model)
  }
  function dispose() {
    if (disposed.value) { return }
    disposed.value = true
    left.dispose()
    right.dispose()
  }
  function close() {
    dispose()
    visible.value = false
    notice.value = '比较已关闭；两侧计时器、迭代器与 SDK 订阅均执行各自清理。下方显示真实迭代器清理记录。'
  }
  onUnload(dispose)
  onUnmounted(dispose)
  return { models: displayedModels, boundPrompt, uncontrolled, rejectPrompt, disabled, visible, ordinaryChat, loading, catalogError, notice, leftState, rightState, leftLifecycle, rightLifecycle, busy, chatDisabled, disabledLabel, promptModeLabel, rejectionLabel, metricsLabel, selection, showMetrics, toolExampleLabel, toolExampleDisabled, updatePrompt, changeModel, run, advanceToolExample, replaceLeftToolExample, retry, approve, reject, retryInterrupts, cancelInterrupts, stop, sendChat, newConversation, toggleMode, togglePromptMode, clearPrompt, setCatalog, toggleAvailability, close }
}
