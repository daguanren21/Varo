<script setup lang="ts">
import type { AgentStreamSnapshot } from '@varo-ui/ai'
import type {
  MallAddress,
  MallAddressDraft,
  MallAgentMessage,
  MallHistoryItem,
  MallOrder,
  PendingAction,
} from '../../features/mall/useMallAgent'
import type { AgentChoice, AgentTask } from '../agent-ui/types'
import { computed, shallowRef } from 'wevu'
import AgentApproval from '../agent-ui/AgentApproval.vue'
import AgentComposer from '../agent-ui/AgentComposer.vue'
import AgentEventRenderer from '../agent-ui/AgentEventRenderer.vue'
import AgentMessage from '../agent-ui/AgentMessage.vue'
import AgentTaskList from '../agent-ui/AgentTaskList.vue'
import VButton from '../ui/v-button.vue'
import VIcon from '../ui/v-icon.vue'
import MallAddressEditor from './MallAddressEditor.vue'
import MallOrderHistory from './MallOrderHistory.vue'

const props = withDefaults(
  defineProps<{
    addressEditorOpen?: boolean
    approvalChoices?: AgentChoice[]
    approvalValue?: string
    busy?: boolean
    defaultAddress?: MallAddress
    history?: MallHistoryItem[]
    historyOpen?: boolean
    messages?: MallAgentMessage[]
    open?: boolean
    orders?: MallOrder[]
    pendingAction?: PendingAction
    streamSnapshot?: AgentStreamSnapshot
    tasks?: AgentTask[]
  }>(),
  {
    addressEditorOpen: false,
    approvalChoices: () => [],
    approvalValue: '',
    busy: false,
    history: () => [],
    historyOpen: false,
    messages: () => [],
    open: false,
    orders: () => [],
    pendingAction: undefined,
    streamSnapshot: undefined,
    tasks: () => [],
  },
)

const emit = defineEmits<{
  'approve': [value: string]
  'close': []
  'reject': []
  'returnOrder': [order: MallOrder]
  'saveAddress': [address: MallAddressDraft]
  'send': [prompt: string]
  'update:approvalValue': [value: string]
}>()

const prompt = shallowRef('')
const suggestions = ['买一盒牛奶', '我要退货', '查看订单历史', '修改收货地址']
const approvalTitle = computed(() => {
  if (props.pendingAction?.type === 'purchase') {
    return `确认购买 ${props.pendingAction.product.name}`
  }
  if (props.pendingAction?.type === 'return') {
    return `确认退货 ${props.pendingAction.order.productName}`
  }
  return ''
})
const approvalDescription = computed(() => {
  if (props.pendingAction?.type === 'purchase') {
    return `单价 ¥${(props.pendingAction.product.price / 100).toFixed(2)}，确认后 Agent 将创建真实演示订单。`
  }
  if (props.pendingAction?.type === 'return') {
    return `订单 ${props.pendingAction.order.id}，确认后 Agent 将提交退货申请。`
  }
  return ''
})
const approveText = computed(() => (props.pendingAction?.type === 'purchase' ? '确认下单' : '提交退货'))

function send(value: string) {
  prompt.value = ''
  emit('send', value)
}

function messageContent(message: MallAgentMessage) {
  return String(message.content ?? '')
}
</script>

<template>
  <view v-if="open" class="fixed bottom-0 left-0 right-0 top-0 z-50 overflow-hidden bg-slate-950/45" @click.self="emit('close')">
    <view class="absolute bottom-0 left-0 right-0 grid max-h-[92vh] min-h-[72vh] max-w-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-t-[24px] bg-slate-50 shadow-[0_-20px_60px_rgba(15,23,42,.24)]">
      <view class="box-border flex min-h-14 w-full min-w-0 items-center gap-3 overflow-hidden border-b border-slate-200 bg-white px-3.5">
        <view class="grid h-9 w-9 flex-none place-items-center rounded-xl bg-teal-700 text-sm font-black text-white">
          V
        </view>
        <view class="grid min-w-0 flex-1 gap-0.5">
          <view class="flex items-center gap-2">
            <text class="text-sm font-extrabold text-slate-950">
              Varo 购物 Agent
            </text>
            <text class="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
              本地演示
            </text>
          </view>
          <text class="text-[10px] text-slate-400">
            购买与退货始终需要人工确认
          </text>
        </view>
        <VButton class="h-10 w-10 flex-none !p-0" variant="ghost" shape="round" aria-label="关闭 Agent" @click="emit('close')">
          <VIcon name="close" size="18" />
        </VButton>
      </view>

      <scroll-view class="box-border min-h-0 w-full overflow-x-hidden px-3.5 py-3" scroll-y :scroll-with-animation="true">
        <view class="grid gap-3 pb-2">
          <AgentMessage
            v-for="message in messages"
            :key="message.id"
            :content="messageContent(message)"
            :markdown="message.role !== 'user'"
            :role="message.role"
            :timestamp="message.timestamp"
          />

          <AgentEventRenderer
            v-if="streamSnapshot && streamSnapshot.status !== 'idle'"
            :snapshot="streamSnapshot"
          />

          <AgentTaskList v-if="tasks.length" title="执行进度" :tasks="tasks" />

          <AgentApproval
            v-if="pendingAction"
            :title="approvalTitle"
            :description="approvalDescription"
            :choices="approvalChoices"
            :value="approvalValue"
            :approve-text="approveText"
            @update:value="emit('update:approvalValue', $event)"
            @approve="emit('approve', $event)"
            @reject="emit('reject')"
          />

          <MallOrderHistory v-if="historyOpen" :orders="orders" :history="history" @return="emit('returnOrder', $event)" />
          <MallAddressEditor
            v-if="addressEditorOpen"
            :initial="defaultAddress"
            @cancel="emit('close')"
            @save="emit('saveAddress', $event)"
          />
        </view>
      </scroll-view>
      <view class="box-border w-full overflow-hidden border-t border-slate-200 bg-white px-3.5 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5">
        <AgentComposer v-model="prompt" :busy="busy" :suggestions="suggestions" @submit="send" />
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
