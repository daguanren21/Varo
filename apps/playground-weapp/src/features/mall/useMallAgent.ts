import type { StreamChunk } from '@tanstack/ai'
import type { ChatClientSnapshot } from '@tanstack/ai-client'
import type { ComputedRef, ShallowRef } from 'wevu'
import type { AgentChoice, AgentTask } from '../../components/agent-ui/types'
import { EventType, hashSchemaInput, normalizeApprovalSchema, toolDefinition, withInterruptBinding } from '@tanstack/ai/client'
import { ChatClient, stream } from '@tanstack/ai-client'
import { computed, onUnload, onUnmounted, shallowRef } from 'wevu'
import { agentConversationHistory } from '../../components/agent-ui/presentation'

export interface MallProduct {
  accent: string
  category: string
  id: string
  name: string
  price: number
  rating: string
  stock: number
  subtitle: string
}

export type MallOrderStatus = 'paid' | 'shipping' | 'delivered' | 'returned'

export interface MallOrder {
  address: string
  createdAt: string
  id: string
  productId: string
  productName: string
  quantity: number
  status: MallOrderStatus
  total: number
}

export interface MallAddress {
  detail: string
  id: string
  isDefault: boolean
  name: string
  phone: string
}

export interface MallHistoryItem {
  detail: string
  id: string
  time: string
  title: string
  type: 'address' | 'order' | 'return'
}

export interface MallAgentMessage {
  content: string
  id: string
  role: 'assistant' | 'user' | 'system'
  timestamp: string
}

export type PendingAction
  = | { product: MallProduct, quantity: number, type: 'purchase' }
    | { order: MallOrder, reason: string, type: 'return' }

export type MallAddressDraft = Omit<MallAddress, 'id'> & { id?: string }

export interface MallAgentController {
  addresses: ShallowRef<MallAddress[]>
  addressEditorOpen: ShallowRef<boolean>
  approvalChoices: ShallowRef<AgentChoice[]>
  approvalValue: ShallowRef<string>
  approve: (id: string) => Promise<void>
  busy: ComputedRef<boolean>
  buyProduct: (product: MallProduct) => void
  cartCount: ComputedRef<number>
  defaultAddress: ComputedRef<MallAddress | undefined>
  history: ShallowRef<MallHistoryItem[]>
  historyOpen: ShallowRef<boolean>
  messages: ComputedRef<MallAgentMessage[]>
  orders: ShallowRef<MallOrder[]>
  pendingAction: ShallowRef<PendingAction | undefined>
  products: ShallowRef<MallProduct[]>
  reject: (id: string) => void
  returnOrder: (order: MallOrder) => void
  saveAddress: (address: MallAddressDraft) => Promise<void>
  send: (prompt: string) => Promise<void>
  streamSnapshot: ShallowRef<ChatClientSnapshot>
  tasks: ShallowRef<AgentTask[]>
}

const INITIAL_PRODUCTS: MallProduct[] = [
  {
    accent: 'linear-gradient(145deg, #111827, #334155)',
    category: '数码',
    id: 'headphones',
    name: '京造降噪耳机 Pro',
    price: 39900,
    rating: '98% 好评',
    stock: 18,
    subtitle: '40dB 主动降噪 · 36 小时续航',
  },
  {
    accent: 'linear-gradient(145deg, #dbeafe, #93c5fd)',
    category: '食品',
    id: 'milk',
    name: '鲜京采纯牛奶 12 盒',
    price: 5990,
    rating: '99% 好评',
    stock: 42,
    subtitle: '原生高钙 · 250mL × 12',
  },
  {
    accent: 'linear-gradient(145deg, #fee2e2, #fca5a5)',
    category: '家电',
    id: 'rice-cooker',
    name: '京选智能电饭煲 4L',
    price: 26900,
    rating: '97% 好评',
    stock: 9,
    subtitle: '智能预约 · 8 段控温',
  },
  {
    accent: 'linear-gradient(145deg, #dcfce7, #86efac)',
    category: '运动',
    id: 'running-shoes',
    name: '轻云缓震跑步鞋',
    price: 32900,
    rating: '96% 好评',
    stock: 24,
    subtitle: '轻量回弹 · 日常慢跑',
  },
]

const PRODUCT_ALIASES: Record<string, string[]> = {
  'headphones': ['耳机', '降噪'],
  'milk': ['牛奶', '鲜奶'],
  'rice-cooker': ['电饭煲', '饭煲'],
  'running-shoes': ['跑步鞋', '运动鞋', '鞋'],
}

function nowLabel() {
  const date = new Date()
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const mallTool = toolDefinition({ name: 'local.mall.execute', description: '修改当前页面内的演示订单；不调用真实支付或商城 API。', needsApproval: true }).client()
const mallApproval = normalizeApprovalSchema(mallTool.approvalSchema, mallTool.inputSchema)

function sleep(duration: number, signal?: AbortSignal) {
  let resolve!: () => void
  let reject!: (error: Error) => void
  const promise = new Promise<void>((done, fail) => { resolve = done; reject = fail })
  const finish = () => { clearTimeout(timer); signal?.removeEventListener('abort', abort); resolve() }
  const abort = () => { clearTimeout(timer); signal?.removeEventListener('abort', abort); reject(new Error('本地商城操作已停止')) }
  const timer = setTimeout(finish, duration)
  signal?.addEventListener('abort', abort, { once: true })
  if (signal?.aborted) { abort() }
  return promise
}

export function useMallAgent(): MallAgentController {
  const products = shallowRef<MallProduct[]>(INITIAL_PRODUCTS.map(product => ({ ...product })))
  const orders = shallowRef<MallOrder[]>([
    {
      address: '上海市浦东新区张江路 88 号',
      createdAt: '昨天 18:42',
      id: 'JD20260819001',
      productId: 'milk',
      productName: '鲜京采纯牛奶 12 盒',
      quantity: 1,
      status: 'delivered',
      total: 5990,
    },
  ])
  const addresses = shallowRef<MallAddress[]>([
    {
      detail: '上海市浦东新区张江路 88 号 3 栋 1202',
      id: 'address-home',
      isDefault: true,
      name: '李小京',
      phone: '13800138000',
    },
  ])
  const history = shallowRef<MallHistoryItem[]>([
    {
      detail: '鲜京采纯牛奶 12 盒 · 已送达',
      id: 'history-initial',
      time: '昨天 18:42',
      title: '订单完成',
      type: 'order',
    },
  ])
  const tasks = shallowRef<AgentTask[]>([])
  const approvalChoices = shallowRef<AgentChoice[]>([])
  const approvalValue = shallowRef('')
  const pendingAction = shallowRef<PendingAction | undefined>(undefined)
  const addressEditorOpen = shallowRef(false)
  const historyOpen = shallowRef(false)
  const defaultAddress = computed(() => addresses.value.find(address => address.isDefault) ?? addresses.value[0])
  const cartCount = computed(() => orders.value.filter(order => order.status === 'paid').length)
  let disposed = false

  const client = new ChatClient({
    threadId: 'varo-mall-agent-demo',
    tools: [mallTool],
    initialMessages: [{ id: 'welcome', role: 'assistant', parts: [{ type: 'text', content: '你好，我是 Varo 购物 Agent。这是本地商城演示，不调用真实支付或业务 API。购买和退货前都会请你确认。' }] }],
    connection: stream(async function* (_messages, data, signal, input): AsyncGenerator<StreamChunk> {
      const id = `mall-${input.runId}`
      let text = ''
      yield { type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId }
      yield { type: EventType.TEXT_MESSAGE_START, messageId: id, role: 'assistant' }
      if (input.resume?.length) {
        const action = pendingAction.value
        const resolution = input.resume[0]!
        const approved = resolution.payload === true || (typeof resolution.payload === 'object' && resolution.payload !== null && 'approved' in resolution.payload && resolution.payload.approved === true)
        if (!approved || !action) {
          clearApproval()
          text = '已取消本次执行，未修改任何订单数据。'
        }
        else {
          tasks.value = [
            { id: 'validate', title: '校验订单与库存', status: 'running', progress: 20 },
            { id: 'execute', title: action.type === 'purchase' ? '创建本地演示订单' : '提交本地退货申请', status: 'waiting' },
            { id: 'record', title: '写入页面内操作记录', status: 'waiting' },
          ]
          await sleep(220, signal)
          tasks.value = tasks.value.map(task => task.id === 'validate' ? { ...task, progress: 100, status: 'completed' } : task.id === 'execute' ? { ...task, progress: 45, status: 'running' } : task)
          await sleep(260, signal)
          if (action.type === 'purchase') {
            const address = defaultAddress.value
            const product = products.value.find(item => item.id === action.product.id)
            if (!address) {
              addressEditorOpen.value = true
              text = '下单前需要先配置收货地址。'
            }
            else if (!product || product.stock < action.quantity) { text = '当前库存不足，请重新选择数量。' }
            else {
              const order: MallOrder = { address: address.detail, createdAt: nowLabel(), id: `JD${Date.now()}`, productId: product.id, productName: product.name, quantity: action.quantity, status: 'paid', total: product.price * action.quantity }
              orders.value = [order, ...orders.value]
              products.value = products.value.map(item => item.id === product.id ? { ...item, stock: item.stock - action.quantity } : item)
              history.value = [{ detail: `${product.name} × ${action.quantity} · ${(order.total / 100).toFixed(2)} 元`, id: nextId('history'), time: nowLabel(), title: '本地下单成功', type: 'order' }, ...history.value]
              text = `演示订单 ${order.id} 已创建，将送到 ${address.detail}。你可以查看订单历史或申请退货；没有真实付款。`
            }
          }
          else {
            orders.value = orders.value.map(order => order.id === action.order.id ? { ...order, status: 'returned' } : order)
            history.value = [{ detail: `${action.order.productName} · ${action.reason}`, id: nextId('history'), time: nowLabel(), title: '本地退货申请已提交', type: 'return' }, ...history.value]
            text = `演示订单 ${action.order.id} 的退货申请已提交。退款进度会记录在页面内历史中。`
          }
          tasks.value = tasks.value.map(task => ({ ...task, progress: 100, status: 'completed' }))
          clearApproval()
        }
        yield { type: EventType.TOOL_CALL_RESULT, messageId: `result-${resolution.interruptId}`, toolCallId: resolution.interruptId, content: JSON.stringify({ approved, summary: text, local: true }), role: 'tool' }
      }
      else if (data?.reply) { text = String(data.reply) }
      else {
        clearApproval()
        tasks.value = []
        historyOpen.value = false
        addressEditorOpen.value = false
        const request = String(data?.prompt ?? '')
        yield { type: EventType.REASONING_MESSAGE_START, messageId: `intent-${id}`, role: 'reasoning' }
        yield { type: EventType.REASONING_MESSAGE_CONTENT, messageId: `intent-${id}`, delta: '在当前页面内识别购物意图、读取商城数据并生成待确认的执行计划。' }
        yield { type: EventType.REASONING_MESSAGE_END, messageId: `intent-${id}` }
        const lookup = `lookup-${id}`
        yield { type: 'TOOL_CALL_START', toolCallId: lookup, toolCallName: 'local.mall.lookup', parentMessageId: id }
        yield { type: EventType.TOOL_CALL_ARGS, toolCallId: lookup, delta: JSON.stringify({ prompt: request }) }
        yield { type: 'TOOL_CALL_END', toolCallId: lookup }
        await sleep(180, signal)
        if (request.includes('退货') || request.includes('退款')) {
          const order = orders.value.find(item => item.status === 'delivered' || item.status === 'shipping')
          if (order) {
            pendingAction.value = { order, reason: '不想要了', type: 'return' }
            approvalChoices.value = [{ label: '不想要了', value: 'changed-mind' }, { label: '商品问题', value: 'quality', description: '破损、故障或与描述不符' }, { label: '发错商品', value: 'wrong-item' }]
            approvalValue.value = 'changed-mind'
            text = `我找到了订单 ${order.id}：${order.productName}。请选择退货原因，确认后再提交本地申请。`
          }
          else { text = '暂时没有可申请退货的订单。我可以先帮你查看订单历史。' }
        }
        else if (request.includes('地址') || request.includes('收货')) {
          addressEditorOpen.value = true
          text = `当前默认地址是：${defaultAddress.value?.detail ?? '尚未配置'}。你可以在下面修改并保存。`
        }
        else if (request.includes('历史') || request.includes('记录') || request.includes('订单')) {
          historyOpen.value = true
          text = `已整理最近的购买、退货和地址变更记录，共 ${history.value.length} 条。`
        }
        else {
          const product = products.value.find(item => PRODUCT_ALIASES[item.id]?.some(alias => request.includes(alias)))
          if (request.includes('买') || request.includes('购买') || request.includes('下单') || product) {
            const selected = product ?? products.value[0]!
            const quantity = Math.max(1, Math.min(9, Number(request.match(/(\d+)\s*[件个盒双台]?/)?.[1] ?? 1)))
            if (selected.stock < quantity) { text = `库存只剩 ${selected.stock} 件，无法购买 ${quantity} 件。你可以减少数量。` }
            else {
              pendingAction.value = { product: selected, quantity, type: 'purchase' }
              approvalChoices.value = [1, 2, 3].map(count => ({ description: `${(selected.price * count / 100).toFixed(2)} 元`, label: `${count} 件`, value: String(count) }))
              approvalValue.value = String(Math.min(3, quantity))
              text = `已找到 ${selected.name}，当前价 ${(selected.price / 100).toFixed(2)} 元。请选择数量并确认本地下单。`
            }
          }
          else { text = '我可以帮你购买耳机、牛奶、电饭煲或跑步鞋。也可以说“查看订单历史”“我要退货”或“修改收货地址”。' }
        }
        yield { type: EventType.TOOL_CALL_RESULT, messageId: `result-${lookup}`, toolCallId: lookup, content: JSON.stringify({ summary: text }), role: 'tool' }
      }
      for (const chunk of text.match(/[\s\S]{1,4}/gu) ?? []) {
        await sleep(36, signal)
        yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId: id, delta: chunk }
      }
      if (pendingAction.value) {
        const toolCallId = `execute-${input.runId}`
        yield { type: 'TOOL_CALL_START', toolCallId, toolCallName: mallTool.name, parentMessageId: id }
        yield { type: EventType.TOOL_CALL_ARGS, toolCallId, delta: JSON.stringify(pendingAction.value) }
        yield { type: 'TOOL_CALL_END', toolCallId }
        yield { type: EventType.TEXT_MESSAGE_END, messageId: id }
        yield { type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId, outcome: { type: 'interrupt', interrupts: [withInterruptBinding({ id: toolCallId, toolCallId, reason: 'tool_call', message: '确认后仅修改当前页面的演示订单。', responseSchema: mallApproval.responseSchema, metadata: { kind: 'approval', toolName: mallTool.name, input: pendingAction.value } }, { v: 1, kind: 'tool-approval', interruptId: toolCallId, interruptedRunId: input.runId, generation: 0, toolName: mallTool.name, toolCallId, originalArgs: pendingAction.value, inputSchemaHash: hashSchemaInput(mallTool.inputSchema), approvalSchemaHash: mallApproval.approvalSchemaHash, responseSchemaHash: mallApproval.responseSchemaHash })] } }
        return
      }
      yield { type: EventType.TEXT_MESSAGE_END, messageId: id }
      yield { type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId }
    }),
  })
  const streamSnapshot = shallowRef<ChatClientSnapshot>(client.getSnapshot())
  const unsubscribeStream = client.subscribeSnapshot(() => { streamSnapshot.value = client.getSnapshot() })
  const busy = computed(() => streamSnapshot.value.isLoading || streamSnapshot.value.interruptState.resuming)
  const messages = computed<MallAgentMessage[]>(() => agentConversationHistory(streamSnapshot.value, nowLabel()))
  function clearApproval() {
    pendingAction.value = undefined
    approvalChoices.value = []
    approvalValue.value = ''
  }
  async function send(prompt: string) {
    const value = prompt.trim()
    if (!value || busy.value || disposed || client.getInterrupts().length) { return }
    await client.sendMessage(value, { prompt: value })
  }
  async function approve(id: string) {
    if (busy.value || disposed || !pendingAction.value) { return }
    const interrupt = client.getInterrupts().find(item => item.id === id)
    if (interrupt?.kind !== 'tool-approval' || !interrupt.canResolve) { return }
    const choice = approvalValue.value
    const action = pendingAction.value
    pendingAction.value = action.type === 'purchase' ? { ...action, quantity: Math.max(1, Math.min(9, Number(choice) || action.quantity)) } : { ...action, reason: approvalChoices.value.find(item => item.value === choice)?.label ?? action.reason }
    interrupt.resolveInterrupt(true)
  }
  function reject(id: string) {
    if (busy.value || disposed) { return }
    const interrupt = client.getInterrupts().find(item => item.id === id)
    if (interrupt?.kind === 'tool-approval' && interrupt.canResolve) { interrupt.resolveInterrupt(false) }
  }
  async function saveAddress(address: MallAddressDraft) {
    if (busy.value || disposed || client.getInterrupts().length) { return }
    const saved: MallAddress = { ...address, id: address.id ?? nextId('address') }
    addresses.value = address.isDefault ? [saved, ...addresses.value.filter(item => item.id !== saved.id).map(item => ({ ...item, isDefault: false }))] : [saved, ...addresses.value.filter(item => item.id !== saved.id)]
    history.value = [{ detail: saved.detail, id: nextId('history'), time: nowLabel(), title: '收货地址已更新', type: 'address' }, ...history.value]
    addressEditorOpen.value = false
    await client.sendMessage('保存收货地址', { reply: `收货地址已保存：${saved.detail}` })
  }
  function buyProduct(product: MallProduct) { void send(`购买 1 件${product.name}`) }
  function returnOrder(order: MallOrder) { void send(`退货 ${order.productName}`) }
  function cleanup() {
    if (disposed) { return }
    disposed = true
    client.stop()
    unsubscribeStream()
    client.detach()
    client.dispose()
  }
  onUnload(cleanup)
  onUnmounted(cleanup)
  return { addresses, addressEditorOpen, approvalChoices, approvalValue, approve, busy, buyProduct, cartCount, defaultAddress, history, historyOpen, messages, orders, pendingAction, products, reject, returnOrder, saveAddress, send, streamSnapshot, tasks }
}
