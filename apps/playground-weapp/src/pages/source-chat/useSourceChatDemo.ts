import type { AgentCitationItem } from '../../components/agent-ui/advanced-types'
import type { AgentConversationMessage } from '../../components/agent-ui/types'
import type { AgentContextSource, AgentRetrievalItem, AgentSourceReceiptItem } from '../../components/agent-ui/workspace-types'
import type { AgentSourceChatResponseState, AgentSourceChatTicketIntent } from '../../components/blocks/agent-source-chat.types'
import { computed, shallowRef } from 'wevu'

export function useSourceChatDemo() {
  const sources = shallowRef<AgentContextSource[]>([
    { id: 'handbook', label: '本地知识库', enabled: true, status: 'available', description: '演示数据：退换货说明，不代表已连接服务。' },
    { id: 'archive', label: '演示归档', enabled: false, status: 'unavailable', description: '未连接；连接按钮只发出应用意图。' },
  ])
  const prompt = shallowRef('')
  const uncontrolled = shallowRef(false)
  const boundPrompt = computed(() => uncontrolled.value ? undefined : prompt.value)
  const promptModeLabel = computed(() => uncontrolled.value ? '切换为受控输入' : '切换为非受控输入')
  const disabled = shallowRef(false)
  const disabledLabel = computed(() => disabled.value ? '启用操作' : '禁用操作')
  const visible = shallowRef(true)
  const messages = shallowRef<AgentConversationMessage[]>([])
  const retrieval = shallowRef<AgentRetrievalItem[]>([])
  const receipts = shallowRef<AgentSourceReceiptItem[]>([])
  const citations = shallowRef<AgentCitationItem[]>([])
  const responseState = shallowRef<AgentSourceChatResponseState>('idle')
  const responseDetail = shallowRef('本地演示：提交问题后，使用演示控制手动推进检索；不调用模型或网络。')
  const ticket = shallowRef<AgentSourceChatTicketIntent | undefined>(undefined)
  const ticketRequest = shallowRef('尚未申请转交')
  const documentTitle = shallowRef('')
  const documentContent = shallowRef('')
  const question = shallowRef('')
  const connectionIntents = shallowRef(0)
  const ticketIntents = shallowRef(0)
  const citationIntents = shallowRef(0)
  const receiptIntents = shallowRef(0)
  const scopeChanges = shallowRef(0)
  const submissions = shallowRef(0)
  const busy = computed(() => responseState.value === 'retrieving')
  const locked = computed(() => disabled.value || busy.value)
  const canResolve = computed(() => busy.value && !disabled.value)
  const canRead = computed(() => canResolve.value && retrieval.value.some(item => item.status === 'queued'))
  const connecting = computed(() => sources.value.some(source => source.status === 'connecting'))
  const connectionDisabled = computed(() => locked.value || !connecting.value)
  const handbookAvailable = computed(() => sources.value[0].status === 'available')
  const availabilityLabel = computed(() => handbookAvailable.value ? '模拟来源不可用' : '恢复演示来源')
  const diagnostic = computed(() => `response=${responseState.value};mode=${uncontrolled.value ? 'uncontrolled' : 'controlled'};scope=${sources.value.filter(source => source.enabled && source.status === 'available').map(source => source.id).join(',') || 'none'};submits=${submissions.value};connections=${connectionIntents.value};toggles=${scopeChanges.value};citations=${citationIntents.value};receipts=${receiptIntents.value};tickets=${ticketIntents.value}`)

  function clearResult() {
    retrieval.value = []
    receipts.value = []
    citations.value = []
    ticket.value = undefined
    documentTitle.value = ''
    documentContent.value = ''
  }
  function updatePrompt(value: string) {
    if (!uncontrolled.value) { prompt.value = value }
  }
  function submit(value: string) {
    if (locked.value || !value.trim()) { return }
    const selected = sources.value.filter(source => source.enabled && source.status === 'available')
    if (!selected.length) { return }
    clearResult()
    question.value = value.trim()
    prompt.value = ''
    submissions.value += 1
    messages.value = [{ id: `question-${submissions.value}`, role: 'user', content: question.value }]
    retrieval.value = selected.map(source => ({ id: source.id, sourceId: source.id, title: source.label, status: 'queued', detail: '演示检索已排队，等待手动推进。' }))
    responseState.value = 'retrieving'
    responseDetail.value = '本地演示检索排队中；请选择读取进度与结果，不会发送网络请求。'
  }
  function read() {
    if (!canRead.value) { return }
    retrieval.value = retrieval.value.map(item => ({ ...item, status: 'reading', detail: '正在读取本地演示条目。' }))
    responseDetail.value = '本地演示读取中；可停止或手动选择结果。'
  }
  function resolve(outcome: 'answered' | 'failed' | 'empty' | 'out-of-scope') {
    if (!canResolve.value) { return }
    responseState.value = outcome
    const status = outcome === 'failed' ? 'failed' : outcome === 'out-of-scope' ? 'skipped' : 'read'
    const detail = outcome === 'answered'
      ? '演示条目：签收后七天内可申请退货，实际政策由商家确认。'
      : outcome === 'failed'
        ? '演示读取失败；可以重试或请求转交，不会虚构回答。'
        : outcome === 'empty'
          ? '已读取演示来源，但没有匹配条目；请修改问题或请求转交。'
          : '问题不在已选演示来源的范围内；请调整范围或请求转交。'
    responseDetail.value = detail
    retrieval.value = retrieval.value.map(item => ({ ...item, status, detail, retryable: outcome === 'failed' }))
    receipts.value = retrieval.value.map(item => ({ id: item.id, label: `${item.title}回执`, status, detail, itemCount: outcome === 'answered' ? 1 : 0 }))
    if (outcome === 'answered') {
      messages.value = [...messages.value, { id: `answer-${submissions.value}`, role: 'assistant', content: detail }]
      citations.value = retrieval.value.map(item => ({ id: item.id, title: `本地知识条目：${item.title}`, domain: '本地演示文档', description: '打开应用内演示原文，不访问外部链接。' }))
    }
    else {
      ticket.value = { question: question.value, reason: outcome, sourceIds: retrieval.value.map(item => item.id) }
    }
  }
  function retryRetrieval(item: AgentRetrievalItem) {
    if (locked.value || item.status !== 'failed' || !item.retryable) { return }
    submit(question.value)
  }
  function setSources(value: AgentContextSource[]) {
    sources.value = value
    if (!retrieval.value.some(item => item.status === 'failed')) { return }
    retrieval.value = retrieval.value.map(item => item.status === 'failed'
      ? { ...item, retryable: value.some(source => source.id === item.sourceId && source.enabled && source.status === 'available') }
      : item)
  }
  function toggleSource([source, enabled]: [AgentContextSource, boolean]) {
    if (locked.value || source.status !== 'available' || source.enabled === enabled) { return }
    setSources(sources.value.map(item => item.id === source.id ? { ...item, enabled } : item))
    scopeChanges.value += 1
  }
  function connectSource(source: AgentContextSource) {
    if (locked.value || source.status !== 'unavailable') { return }
    connectionIntents.value += 1
    setSources(sources.value.map(item => item.id === source.id ? { ...item, enabled: false, status: 'connecting' } : item))
    responseDetail.value = `收到连接意图：${source.label}。请手动完成演示连接；未连接真实服务。`
  }
  function completeConnection() {
    if (connectionDisabled.value) { return }
    setSources(sources.value.map(source => source.status === 'connecting' ? { ...source, enabled: false, status: 'available', description: '本地演示可用；仍需明确启用才加入范围。' } : source))
    responseDetail.value = '演示来源已标为可用，但尚未加入知识范围；这不是实际服务连接。'
  }
  function toggleAvailability() {
    if (locked.value) { return }
    setSources(sources.value.map(source => source.id === 'handbook' ? { ...source, enabled: false, status: handbookAvailable.value ? 'unavailable' : 'available' } : source))
  }
  function openCitation(item: AgentCitationItem) {
    citationIntents.value += 1
    documentTitle.value = item.title
    documentContent.value = '本地演示原文：签收后七天内可申请退货。申请时请提供订单信息；实际退换货政策由商家确认。'
  }
  function openReceipt(item: AgentSourceReceiptItem) {
    receiptIntents.value += 1
    documentTitle.value = item.label
    documentContent.value = item.detail ?? ''
  }
  function connectReceipt(item: AgentSourceReceiptItem) {
    connectionIntents.value += 1
    responseDetail.value = `收到回执连接意图：${item.label}。应用仍需检查连接与权限；演示没有执行连接。`
  }
  function createTicket(intent: AgentSourceChatTicketIntent) {
    if (locked.value || !ticket.value) { return }
    ticketIntents.value += 1
    ticketRequest.value = `转交申请（未创建工单）：${intent.question}；原因=${intent.reason}；来源=${intent.sourceIds.join(',')}`
    ticket.value = undefined
  }
  function stop() {
    if (!busy.value) { return }
    retrieval.value = retrieval.value.map(item => ({ ...item, status: 'skipped', detail: '应用已停止本地演示检索。', retryable: false }))
    responseState.value = 'idle'
    responseDetail.value = '已停止本地演示检索；没有生成回答。'
  }
  function newConversation() {
    if (locked.value) { return }
    clearResult()
    messages.value = []
    prompt.value = ''
    question.value = ''
    responseState.value = 'idle'
    responseDetail.value = '新问题将只使用当前已启用的演示来源。'
  }
  function togglePromptMode() {
    if (locked.value) { return }
    newConversation()
    uncontrolled.value = !uncontrolled.value
  }
  function close() {
    stop()
    visible.value = false
  }

  return { sources, prompt, uncontrolled, boundPrompt, promptModeLabel, disabled, disabledLabel, visible, messages, retrieval, receipts, citations, responseState, responseDetail, ticket, ticketRequest, documentTitle, documentContent, question, busy, locked, canResolve, canRead, connectionDisabled, availabilityLabel, diagnostic, updatePrompt, submit, read, resolve, retryRetrieval, toggleSource, connectSource, completeConnection, toggleAvailability, openCitation, openReceipt, connectReceipt, createTicket, stop, newConversation, togglePromptMode, close }
}
