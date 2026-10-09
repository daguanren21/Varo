import type { AgentStreamEvent } from '@varo-ui/ai'
import type { AgentModelOption } from '../../components/agent-ui/agent-model-selector.types'
import type { AgentConversationMessage } from '../../components/agent-ui/types'
import type { AgentCompareModelIntent, AgentCompareRunIntent, AgentCompareSide, AgentCompareState } from '../../components/blocks/agent-model-compare.types'
import { createAgentStreamController } from '@varo-ui/ai'
import { computed, onBeforeUnmount, shallowRef } from 'wevu'
import { availableModel } from '../../components/agent-ui/agent-model-selector.types'

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
  let disposed = false
  let sequence = 0

  function createSide(id: AgentCompareSide, initialModel: string) {
    const controller = createAgentStreamController({ text: { flushOnFinish: true } })
    const modelId = shallowRef(initialModel)
    const snapshot = shallowRef(controller.getSnapshot())
    const messages = shallowRef<AgentConversationMessage[]>([])
    const pending = shallowRef(false)
    const elapsed = shallowRef<number | undefined>(undefined)
    const receipt = shallowRef({ steps: 0, cleanups: 0, active: false, timers: 0 })
    const unsubscribe = controller.subscribe(() => { snapshot.value = controller.getSnapshot() })
    let cancelProducer: (() => void) | undefined
    let lastRequest: { prompt: string, modelId: string } | undefined
    const state = computed<AgentCompareState>(() => ({
      label: id === 'left' ? '左侧' : '右侧',
      modelId: modelId.value,
      messages: messages.value,
      snapshot: snapshot.value,
      busy: pending.value,
      error: snapshot.value.status === 'failed' ? snapshot.value.error?.message : undefined,
      retryable: Boolean(lastRequest) && snapshot.value.status === 'failed',
      metrics: showMetrics.value && elapsed.value != null ? { latencyMs: elapsed.value } : undefined,
    }))
    const lifecycle = computed(() => `steps=${receipt.value.steps};cleanups=${receipt.value.cleanups};active=${receipt.value.active};timers=${receipt.value.timers}`)

    async function start(request: string, failFirstAttempt: boolean) {
      if (pending.value || disposed) { return }
      const selectedModel = modelId.value
      const messageId = `${id}-${++sequence}`
      lastRequest = { prompt: request, modelId: selectedModel }
      messages.value = [{ id: `prompt-${messageId}`, role: 'user', content: request }]
      elapsed.value = undefined
      pending.value = true
      receipt.value = { ...receipt.value, steps: 0, active: true }
      const startedAt = Date.now()
      let cancelled = false
      let timer: number | NodeJS.Timeout | undefined
      let wake: (() => void) | undefined
      cancelProducer = () => {
        cancelled = true
        clearTimeout(timer)
        timer = undefined
        receipt.value = { ...receipt.value, timers: 0 }
        wake?.()
      }
      async function* produce(): AsyncGenerator<AgentStreamEvent> {
        try {
          yield { type: 'message.start', messageId, role: 'assistant' }
          const words = request.split(/\s+/u)
          for (let index = 0; index < words.length; index++) {
            await new Promise<void>((resolve) => {
              wake = resolve
              receipt.value = { ...receipt.value, timers: 1 }
              timer = setTimeout(() => {
                timer = undefined
                receipt.value = { ...receipt.value, timers: 0 }
                resolve()
              }, id === 'left' ? 180 : 420)
            })
            wake = undefined
            if (cancelled) { return }
            const word = words[index]!
            const transformed = selectedModel === 'uppercase'
              ? word.toUpperCase()
              : selectedModel === 'reverse'
                ? Array.from(word).reverse().join('')
                : `${word}(${Array.from(word).length})`
            receipt.value = { ...receipt.value, steps: receipt.value.steps + 1 }
            yield { type: 'text.delta', messageId, delta: `${index ? ' ' : ''}${transformed}` }
            if (failFirstAttempt) { throw new Error('左侧本地转换首次执行失败；右侧仍独立运行。') }
          }
          yield { type: 'message.end', messageId }
          yield { type: 'done' }
        }
        finally {
          clearTimeout(timer)
          receipt.value = { ...receipt.value, cleanups: receipt.value.cleanups + 1, active: false, timers: 0 }
        }
      }
      try {
        const result = await controller.connect(produce())
        if (!disposed && result.status === 'completed') { elapsed.value = Date.now() - startedAt }
      }
      finally {
        cancelProducer = undefined
        pending.value = false
      }
    }
    function stop() {
      if (!pending.value) { return }
      cancelProducer?.()
      controller.cancel('应用已停止本侧本地转换')
    }
    function retry() {
      if (!lastRequest || pending.value || snapshot.value.status !== 'failed' || lastRequest.modelId !== modelId.value) { return }
      void start(lastRequest.prompt, false)
    }
    function clear() {
      if (pending.value) { return }
      lastRequest = undefined
      messages.value = []
      elapsed.value = undefined
      controller.reset()
    }
    function select(value: string) {
      if (pending.value || value === modelId.value) { return }
      modelId.value = value
      clear()
    }
    function dispose() {
      cancelProducer?.()
      unsubscribe()
      controller.destroy()
    }
    return { state, pending, modelId, lifecycle, start, stop, retry, select, clear, dispose }
  }

  const left = createSide('left', 'uppercase')
  const right = createSide('right', 'reverse')
  const leftState = left.state
  const rightState = right.state
  const leftLifecycle = left.lifecycle
  const rightLifecycle = right.lifecycle
  const busy = computed(() => left.pending.value || right.pending.value)
  const locked = computed(() => disposed || disabled.value || loading.value || Boolean(catalogError.value))
  const chatDisabled = computed(() => locked.value || !availableModel(displayedModels.value, left.modelId.value))
  const disabledLabel = computed(() => disabled.value ? '启用输入' : '禁用输入')
  const promptModeLabel = computed(() => uncontrolled.value ? '使用受控输入' : '使用非受控输入')
  const rejectionLabel = computed(() => rejectPrompt.value ? '接受提示词更新' : '拒绝提示词更新')
  const metricsLabel = computed(() => showMetrics.value ? '隐藏实测耗时' : '显示本地实测耗时')
  const selection = computed(() => `left=${left.modelId.value};right=${right.modelId.value}`)

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
  function retry(id: AgentCompareSide) {
    const side = id === 'left' ? left : right
    if (!locked.value && availableModel(displayedModels.value, side.modelId.value)) { side.retry() }
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
    if (disposed) { return }
    disposed = true
    left.dispose()
    right.dispose()
  }
  function close() {
    dispose()
    visible.value = false
    notice.value = '比较已关闭；两侧计时器、迭代器与控制器订阅均执行各自清理。下方显示真实迭代器清理记录。'
  }
  onBeforeUnmount(dispose)
  return { models: displayedModels, boundPrompt, uncontrolled, rejectPrompt, disabled, visible, ordinaryChat, loading, catalogError, notice, leftState, rightState, leftLifecycle, rightLifecycle, busy, chatDisabled, disabledLabel, promptModeLabel, rejectionLabel, metricsLabel, selection, showMetrics, updatePrompt, changeModel, run, retry, stop, sendChat, newConversation, toggleMode, togglePromptMode, clearPrompt, setCatalog, toggleAvailability, close }
}
