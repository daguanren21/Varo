import type { AgentStreamEvent, AgentStreamSnapshot } from '@varo-ui/ai'
import type { ComputedRef, ShallowRef } from 'wevu'
import type { AgentChoice, AgentTask, AgentToolCall, AgentTraceStep } from '../../components/agent-ui/types'
import {

  createAgentStreamController,
} from '@varo-ui/ai'
import { computed, onUnload, onUnmounted, shallowRef } from 'wevu'

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
  approve: (value?: string) => Promise<void>
  busy: ShallowRef<boolean>
  buyProduct: (product: MallProduct) => void
  cartCount: ComputedRef<number>
  defaultAddress: ComputedRef<MallAddress | undefined>
  history: ShallowRef<MallHistoryItem[]>
  historyOpen: ShallowRef<boolean>
  messages: ShallowRef<MallAgentMessage[]>
  orders: ShallowRef<MallOrder[]>
  pendingAction: ShallowRef<PendingAction | undefined>
  products: ShallowRef<MallProduct[]>
  reject: () => void
  returnOrder: (order: MallOrder) => void
  saveAddress: (address: MallAddressDraft) => Promise<void>
  send: (prompt: string) => Promise<void>
  streamSnapshot: ShallowRef<AgentStreamSnapshot>
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

function sleep(duration: number) {
  return new Promise<void>(resolve => setTimeout(resolve, duration))
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
  const messages = shallowRef<MallAgentMessage[]>([
    {
      content: '你好，我是 Varo 购物 Agent。我可以帮你找商品、下单、退货、查看记录或配置收货地址。执行购买和退货前，我都会先请你确认。',
      id: 'welcome',
      role: 'assistant',
      timestamp: nowLabel(),
    },
  ])
  const tools = shallowRef<AgentToolCall[]>([])
  const traceSteps = shallowRef<AgentTraceStep[]>([])
  const tasks = shallowRef<AgentTask[]>([])
  const approvalChoices = shallowRef<AgentChoice[]>([])
  const approvalValue = shallowRef('')
  const pendingAction = shallowRef<PendingAction | undefined>(undefined)
  const agentStream = createAgentStreamController({
    text: {
      maxCharsPerCommit: 12,
      maxCharsPerSecond: 420,
      maxCommitFps: 20,
      minCharsPerSecond: 36,
      targetLatencyMs: 520,
    },
  })
  const streamSnapshot = shallowRef<AgentStreamSnapshot>(agentStream.getSnapshot())
  const unsubscribeStream = agentStream.subscribe(() => {
    streamSnapshot.value = agentStream.getSnapshot()
  })
  const busy = shallowRef(false)
  const addressEditorOpen = shallowRef(false)
  const historyOpen = shallowRef(false)
  let activeRun = 0

  const defaultAddress = computed(() => addresses.value.find(address => address.isDefault) ?? addresses.value[0])
  const cartCount = computed(() => orders.value.filter(order => order.status === 'paid').length)

  function addMessage(role: MallAgentMessage['role'], content: string) {
    messages.value = [...messages.value, { content, id: nextId('message'), role, timestamp: nowLabel() }]
  }

  async function* createTextEventStream(text: string, run: number): AsyncGenerator<AgentStreamEvent> {
    for (const step of traceSteps.value) {
      yield { id: step.id, title: step.title, type: 'reasoning.start' }
      if (step.detail) { yield { delta: step.detail, id: step.id, type: 'reasoning.delta' } }
      if (step.status === 'completed') { yield { id: step.id, type: 'reasoning.end' } }
    }
    for (const tool of tools.value) {
      yield { id: tool.id, name: tool.name, summary: tool.summary, type: 'tool.start' }
      if (tool.status === 'completed') {
        yield { id: tool.id, summary: tool.summary, type: 'tool.result' }
      }
      else if (tool.status === 'failed') {
        yield { error: tool.summary ?? 'Tool execution failed', id: tool.id, type: 'tool.error' }
      }
    }

    const messageId = nextId('stream')
    yield { messageId, role: 'assistant', type: 'message.start' }
    const chunks = text.match(/.{1,4}/gu) ?? [text]
    for (const chunk of chunks) {
      await sleep(36)
      if (run !== activeRun) { return }
      yield { delta: chunk, messageId, type: 'text.delta' }
    }
    yield { messageId, type: 'message.end' }
    yield { type: 'done' }
  }

  async function stream(text: string, run: number) {
    const result = await agentStream.connect(createTextEventStream(text, run))
    if (run !== activeRun || result.status === 'cancelled') { return }
    if (result.status === 'failed') { return }
    addMessage('assistant', result.message?.source ?? text)
    agentStream.reset()
  }

  function setStep(id: string, status: AgentTraceStep['status'], detail?: string) {
    traceSteps.value = traceSteps.value.map(step => (step.id === id ? { ...step, detail: detail ?? step.detail, status } : step))
  }

  function findProduct(prompt: string) {
    return products.value.find(product => PRODUCT_ALIASES[product.id].some(alias => prompt.includes(alias)))
  }

  function parseQuantity(prompt: string) {
    const match = prompt.match(/(\d+)\s*[件个盒双台]?/)
    return Math.max(1, Math.min(9, Number(match?.[1] ?? 1)))
  }

  async function send(prompt: string) {
    const value = prompt.trim()
    if (!value || busy.value) { return }

    activeRun += 1
    const run = activeRun
    busy.value = true
    historyOpen.value = false
    addressEditorOpen.value = false
    pendingAction.value = undefined
    approvalChoices.value = []
    approvalValue.value = ''
    addMessage('user', value)
    traceSteps.value = [
      { id: 'intent', title: '理解你的请求', status: 'running' },
      { id: 'lookup', title: '读取商城数据', status: 'waiting' },
      { id: 'plan', title: '生成安全执行计划', status: 'waiting' },
    ]
    tools.value = [{ id: 'catalog', name: 'mall.catalog.search', status: 'running', summary: '正在检索商品与订单' }]
    await sleep(180)
    setStep('intent', 'completed', '已识别购物意图')
    setStep('lookup', 'running')

    try {
      if (value.includes('退货') || value.includes('退款')) {
        const order = orders.value.find(item => item.status === 'delivered' || item.status === 'shipping')
        await sleep(180)
        setStep('lookup', 'completed', order ? `找到订单 ${order.id}` : '没有可退订单')
        setStep('plan', 'completed')
        tools.value = [{ ...tools.value[0], status: 'completed', summary: order ? '已定位可退订单' : '未找到可退订单' }]
        if (!order) {
          await stream('暂时没有可申请退货的订单。我可以先帮你查看订单历史。', run)
          return
        }
        pendingAction.value = { order, reason: '不想要了', type: 'return' }
        approvalChoices.value = [
          { label: '不想要了', value: 'changed-mind' },
          { label: '商品问题', value: 'quality', description: '破损、故障或与描述不符' },
          { label: '发错商品', value: 'wrong-item' },
        ]
        approvalValue.value = 'changed-mind'
        await stream(`我找到了订单 ${order.id}：${order.productName}。请选择退货原因，确认后我再提交申请。`, run)
        return
      }

      if (value.includes('地址') || value.includes('收货')) {
        await sleep(160)
        setStep('lookup', 'completed', `已读取 ${addresses.value.length} 个地址`)
        setStep('plan', 'completed')
        tools.value = [{ id: 'address', name: 'mall.address.read', status: 'completed', summary: '地址数据已就绪' }]
        addressEditorOpen.value = true
        await stream(`当前默认地址是：${defaultAddress.value?.detail ?? '尚未配置'}。你可以在下面修改并保存。`, run)
        return
      }

      if (value.includes('历史') || value.includes('记录') || value.includes('订单')) {
        await sleep(160)
        setStep('lookup', 'completed', `读取到 ${history.value.length} 条记录`)
        setStep('plan', 'completed')
        tools.value = [{ id: 'history', name: 'mall.history.list', status: 'completed', summary: '交易记录已载入' }]
        historyOpen.value = true
        await stream(`已为你整理最近的购买、退货和地址变更记录，共 ${history.value.length} 条。`, run)
        return
      }

      const product = findProduct(value)
      if (value.includes('买') || value.includes('购买') || value.includes('下单') || product) {
        const selectedProduct = product ?? products.value[0]
        const quantity = parseQuantity(value)
        await sleep(180)
        setStep('lookup', 'completed', `找到 ${selectedProduct.name}`)
        setStep('plan', 'completed', `库存 ${selectedProduct.stock} 件`)
        tools.value = [{ id: 'inventory', name: 'mall.inventory.check', status: 'completed', summary: `库存 ${selectedProduct.stock} 件` }]
        if (selectedProduct.stock < quantity) {
          await stream(`库存只剩 ${selectedProduct.stock} 件，无法购买 ${quantity} 件。你可以减少数量。`, run)
          return
        }
        pendingAction.value = { product: selectedProduct, quantity, type: 'purchase' }
        approvalChoices.value = [1, 2, 3].map(count => ({
          description: `${(selectedProduct.price * count / 100).toFixed(2)} 元`,
          label: `${count} 件`,
          value: String(count),
        }))
        approvalValue.value = String(Math.min(3, quantity))
        await stream(`已找到 ${selectedProduct.name}，当前价 ${(selectedProduct.price / 100).toFixed(2)} 元。请选择数量并确认下单。`, run)
        return
      }

      await sleep(150)
      setStep('lookup', 'completed', '已浏览热销商品')
      setStep('plan', 'completed')
      tools.value = [{ id: 'recommend', name: 'mall.recommend', status: 'completed', summary: '生成个性化推荐' }]
      await stream('我可以帮你购买降噪耳机、牛奶、电饭煲或跑步鞋。也可以说“查看订单历史”“我要退货”或“修改收货地址”。', run)
    }
    finally {
      if (run === activeRun) { busy.value = false }
    }
  }

  async function approve(value = approvalValue.value) {
    const action = pendingAction.value
    if (!action || busy.value) { return }
    busy.value = true
    tasks.value = [
      { id: 'validate', title: '校验订单与库存', status: 'running', progress: 20 },
      { id: 'execute', title: action.type === 'purchase' ? '创建商城订单' : '提交退货申请', status: 'waiting' },
      { id: 'record', title: '写入操作记录', status: 'waiting' },
    ]
    await sleep(220)
    tasks.value = tasks.value.map(task => task.id === 'validate' ? { ...task, progress: 100, status: 'completed' } : task.id === 'execute' ? { ...task, progress: 45, status: 'running' } : task)

    if (action.type === 'purchase') {
      const quantity = Math.max(1, Number(value) || action.quantity)
      const address = defaultAddress.value
      if (!address) {
        addressEditorOpen.value = true
        pendingAction.value = undefined
        busy.value = false
        await stream('下单前需要先配置收货地址。', ++activeRun)
        return
      }
      await sleep(260)
      const order: MallOrder = {
        address: address.detail,
        createdAt: nowLabel(),
        id: `JD${Date.now()}`,
        productId: action.product.id,
        productName: action.product.name,
        quantity,
        status: 'paid',
        total: action.product.price * quantity,
      }
      orders.value = [order, ...orders.value]
      products.value = products.value.map(product => product.id === action.product.id ? { ...product, stock: product.stock - quantity } : product)
      history.value = [
        { detail: `${action.product.name} × ${quantity} · ${(order.total / 100).toFixed(2)} 元`, id: nextId('history'), time: nowLabel(), title: 'AI 下单成功', type: 'order' },
        ...history.value,
      ]
      tasks.value = tasks.value.map(task => ({ ...task, progress: 100, status: 'completed' }))
      pendingAction.value = undefined
      approvalChoices.value = []
      approvalValue.value = ''
      busy.value = false
      await stream(`订单 ${order.id} 已创建，将送到 ${address.detail}。你随时可以让我查看订单历史或申请退货。`, ++activeRun)
      return
    }

    await sleep(260)
    orders.value = orders.value.map(order => order.id === action.order.id ? { ...order, status: 'returned' } : order)
    history.value = [
      { detail: `${action.order.productName} · ${value || action.reason}`, id: nextId('history'), time: nowLabel(), title: 'AI 退货申请已提交', type: 'return' },
      ...history.value,
    ]
    tasks.value = tasks.value.map(task => ({ ...task, progress: 100, status: 'completed' }))
    pendingAction.value = undefined
    approvalChoices.value = []
    approvalValue.value = ''
    busy.value = false
    await stream(`订单 ${action.order.id} 的退货申请已提交。退款进度会记录在历史中。`, ++activeRun)
  }

  function reject() {
    pendingAction.value = undefined
    approvalChoices.value = []
    approvalValue.value = ''
    addMessage('system', '已取消本次执行，未修改任何订单数据。')
  }

  async function saveAddress(address: MallAddressDraft) {
    const saved: MallAddress = { ...address, id: address.id ?? nextId('address') }
    addresses.value = address.isDefault
      ? [saved, ...addresses.value.filter(item => item.id !== saved.id).map(item => ({ ...item, isDefault: false }))]
      : [saved, ...addresses.value.filter(item => item.id !== saved.id)]
    history.value = [
      { detail: saved.detail, id: nextId('history'), time: nowLabel(), title: '收货地址已更新', type: 'address' },
      ...history.value,
    ]
    addressEditorOpen.value = false
    await stream(`收货地址已保存：${saved.detail}`, ++activeRun)
  }

  function buyProduct(product: MallProduct) {
    void send(`购买 1 件${product.name}`)
  }

  function returnOrder(order: MallOrder) {
    void send(`退货 ${order.productName}`)
  }

  const controller: MallAgentController = {
    addresses,
    addressEditorOpen,
    approvalChoices,
    approvalValue,
    approve,
    busy,
    buyProduct,
    cartCount,
    defaultAddress,
    history,
    historyOpen,
    messages,
    orders,
    pendingAction,
    products,
    reject,
    returnOrder,
    saveAddress,
    send,
    streamSnapshot,
    tasks,
  }

  const cleanup = () => {
    activeRun += 1
    agentStream.cancel('Mall Agent page unloaded')
    unsubscribeStream()
    agentStream.destroy()
  }
  if (typeof onUnload === 'function') {
    onUnload(cleanup)
  }
  else { onUnmounted(cleanup) }

  return controller
}
