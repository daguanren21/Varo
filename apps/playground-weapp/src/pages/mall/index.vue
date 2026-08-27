<script setup lang="ts">
import { computed, shallowRef } from 'wevu'
import MallAgentPanel from '../../components/mall/MallAgentPanel.vue'
import MallHeader from '../../components/mall/MallHeader.vue'
import MallProductGrid from '../../components/mall/MallProductGrid.vue'
import { useMallAgent, type MallProduct } from '../../features/mall/useMallAgent'

type MaybeRef<T> = T | { value: T }

interface AutomationSnapshot {
  eventCount: number
  message?: { source: string }
  reasoning: unknown[]
  status: string
  tools: unknown[]
}

interface MallPageAutomationContext {
  __wevu?: {
    proxy?: {
      busy?: MaybeRef<boolean>
      confirmAgentAction?: (value: string) => Promise<void>
      messages?: MaybeRef<Array<{ content: string }>>
      orders?: MaybeRef<Array<{ productId: string; status: string }>>
      pendingAction?: MaybeRef<{ type: string } | undefined>
      runAgentPrompt?: (prompt: string) => Promise<void>
      streamSnapshot?: MaybeRef<AutomationSnapshot>
    }
  }
}


defineOptions({
  methods: {
    automationApprovePurchase(this: MallPageAutomationContext) {
      const confirm = this.__wevu?.proxy?.confirmAgentAction
      if (!confirm) return false
      void confirm('1')
      return true
    },
    automationInspect(this: MallPageAutomationContext) {
      const proxy = this.__wevu?.proxy
      function unwrap<T>(value: MaybeRef<T> | undefined): T | undefined {
        if (value && typeof value === 'object' && 'value' in value) return value.value
        return value
      }
      const busy = unwrap(proxy?.busy)
      const messages = unwrap(proxy?.messages)
      const orders = unwrap(proxy?.orders)
      const pendingAction = unwrap(proxy?.pendingAction)
      const snapshot = unwrap(proxy?.streamSnapshot)
      return {
        busy,
        eventCount: snapshot?.eventCount ?? 0,
        latestProduct: orders?.[0]?.productId,
        latestStatus: orders?.[0]?.status,
        messageCount: messages?.length ?? 0,
        orderCount: orders?.length ?? 0,
        pendingAction: pendingAction?.type,
        reasoningCount: snapshot?.reasoning.length ?? 0,
        sourceLength: snapshot?.message?.source.length ?? 0,
        status: snapshot?.status,
        toolCount: snapshot?.tools.length ?? 0
      }
    },
    automationRunPurchase(this: MallPageAutomationContext) {
      const run = this.__wevu?.proxy?.runAgentPrompt
      if (!run) return false
      void run('买 1 盒牛奶')
      return true
    }
  }
})

const agentOpen = shallowRef(false)
const {
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
} = useMallAgent()
const headerAddress = computed(() => defaultAddress.value?.detail ?? '')
const headerCartCount = computed(() => Number(cartCount.value ?? 0))
const panelApprovalValue = computed({
  get: () => approvalValue.value ?? '',
  set: (value: string) => { approvalValue.value = value }
})



const categories = [
  { label: '京东超市', mark: '超' },
  { label: '数码电器', mark: '数' },
  { label: '生鲜到家', mark: '鲜' },
  { label: '新品首发', mark: '新' }
]

function openAgent() {
  agentOpen.value = true
}

function ask(prompt: string) {
  agentOpen.value = true
  void send(prompt)
}

function buy(product: MallProduct) {
  agentOpen.value = true
  buyProduct(product)
}

async function runAgentPrompt(prompt: string) {
  agentOpen.value = true
  await send(prompt)
}

async function confirmAgentAction(value: string) {
  await approve(value)
}

defineExpose({
  confirmAgentAction,
  openAgent,
  runAgentPrompt
})
</script>

<template>
  <view class="min-h-screen bg-[#f5f5f5] pb-28 text-slate-950">
    <MallHeader
      :address="headerAddress"
      :cart-count="headerCartCount"
      @address="ask('修改收货地址')"
      @history="ask('查看订单历史')"
      @search="ask(`帮我搜索并介绍 ${$event}`)"
    />

    <view class="grid gap-3 px-3 pt-3">
      <view class="relative overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#7f1d1d_0%,#e1251b_58%,#fb7185_100%)] p-4 text-white shadow-[0_10px_28px_rgba(185,28,28,.22)]">
        <view class="relative z-10 grid max-w-[72%] gap-2">
          <text class="text-[10px] font-extrabold tracking-[.18em] text-white/75">VARO AGENT MALL</text>
          <text class="text-[22px] font-black leading-7">AI 帮你买，执行前先确认</text>
          <text class="text-[11px] leading-[18px] text-white/80">自然语言找商品、下单、退货、查历史与配置地址。</text>
          <button class="mt-1 inline-flex min-h-9 w-fit items-center justify-center rounded-full border border-white/30 bg-white px-3.5 text-[11px] font-extrabold text-[#e1251b]" type="button" @click="openAgent">
            试试 AI 导购
          </button>
        </view>
        <view class="absolute -right-5 -top-8 h-36 w-36 rounded-full border-[22px] border-white/10" />
        <view class="absolute bottom-3 right-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-xl font-black backdrop-blur">V</view>
      </view>

      <view class="grid grid-cols-4 gap-2 rounded-2xl bg-white px-2 py-3 shadow-[0_3px_14px_rgba(15,23,42,.05)]">
        <button v-for="category in categories" :key="category.label" class="grid min-h-16 place-items-center gap-1 bg-transparent p-0" type="button" @click="ask(`看看${category.label}有什么推荐`)" >
          <text class="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-sm font-black text-[#e1251b]">{{ category.mark }}</text>
          <text class="text-[10px] font-semibold text-slate-600">{{ category.label }}</text>
        </button>
      </view>

      <view class="flex items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-emerald-50/80 px-3.5 py-3">
        <view class="flex min-w-0 items-center gap-2.5">
          <view class="grid h-9 w-9 flex-none place-items-center rounded-xl bg-teal-700 text-sm font-black text-white">AI</view>
          <view class="grid min-w-0 gap-0.5">
            <text class="text-xs font-extrabold text-teal-950">智能购物保障</text>
            <text class="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-teal-700">购买和退货均需要你的二次确认</text>
          </view>
        </view>
        <button class="inline-flex min-h-9 flex-none items-center justify-center rounded-full bg-teal-700 px-3 text-[11px] font-bold text-white" type="button" @click="ask('你能帮我做什么')">了解</button>
      </view>

      <view class="flex items-end justify-between gap-3 pt-1">
        <view>
          <text class="text-lg font-black text-slate-950">京选好物</text>
          <text class="mt-0.5 block text-[10px] text-slate-400">真实本地状态 · AI 可执行</text>
        </view>
        <button class="flex min-h-9 items-center justify-center gap-1 bg-transparent p-0 text-[11px] font-bold text-[#e1251b]" type="button" @click="ask('推荐最值得买的商品')">
          AI 推荐 <text aria-hidden="true">›</text>
        </button>
      </view>

      <MallProductGrid :products="products" @buy="buy" @select="ask(`介绍一下${$event.name}`)" />
    </view>

    <button
      class="fixed bottom-[calc(env(safe-area-inset-bottom)+18px)] right-4 z-40 grid h-[52px] w-[52px] place-items-center rounded-full border-2 border-white bg-teal-700 text-[11px] font-black text-white shadow-[0_8px_24px_rgba(15,118,110,.28)]"
      type="button"
      id="agent-entry"
      aria-label="打开 AI 导购"
      hover-class="scale-95"
      :hover-start-time="20"
      :hover-stay-time="70"
      @click="openAgent"
    >
      <text>AI</text>
      <text v-if="busy" class="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-300" aria-label="正在处理" />
    </button>

    <MallAgentPanel
      :open="agentOpen"
      :busy="busy"
      :messages="messages"
      :stream-snapshot="streamSnapshot"
      :tasks="tasks"
      :pending-action="pendingAction"
      :approval-choices="approvalChoices"
      :approval-value="panelApprovalValue"
      :history-open="historyOpen"
      :address-editor-open="addressEditorOpen"
      :orders="orders"
      :history="history"
      :default-address="defaultAddress"
      @close="agentOpen = false"
      @send="send"
      @approve="approve"
      @reject="reject"
      @update:approval-value="panelApprovalValue = $event"
      @return-order="returnOrder"
      @save-address="saveAddress"
    />
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Varo AI 京东商城",
  "navigationStyle": "custom",
  "usingComponents": {}
}
</json>
