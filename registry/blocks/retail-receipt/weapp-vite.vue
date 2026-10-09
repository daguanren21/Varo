<script setup lang="ts">
import type { RetailReceipt, RetailReceiptAction } from './retail-receipt.types'
import { computed } from 'wevu'
import { formatRetailMoney } from '../../lib/retail'
import VEmpty from '../ui/empty.vue'
import VButton from '../ui/v-button.vue'

defineOptions({ properties: { receipt: { type: null, value: null } } })
const props = withDefaults(defineProps<{
  receipt?: RetailReceipt | null
  loading?: boolean
  disabled?: boolean
  busy?: boolean
  error?: string
}>(), { loading: false, disabled: false, busy: false, error: '' })
const emit = defineEmits<{ action: [payload: { receiptId: string, orderId: string, action: RetailReceiptAction }] }>()
const blocked = computed(() => props.loading || props.disabled || props.busy)
const orderLabels = { 'pending-payment': '待付款', 'pending-delivery': '待发货', 'pending-receipt': '待收货', 'completed': '已完成', 'after-sale': '售后中' }
const paymentLabels = { unpaid: '未支付', pending: '支付处理中', paid: '已支付', failed: '支付失败', refunded: '已退款' }
const summary = computed(() => props.receipt
  ? {
      order: orderLabels[props.receipt.orderStatus],
      payment: paymentLabels[props.receipt.paymentStatus],
      paid: `¥${formatRetailMoney(props.receipt.paidTotal)}`,
    }
  : null)
const actions = computed(() => ([
  { action: 'refund' as const, label: '申请退款' },
  { action: 'contact' as const, label: '联系商家' },
  { action: 'download' as const, label: '下载凭证' },
]).map(item => ({ ...item, disabled: blocked.value || props.receipt?.grants[item.action] !== true })))
function request(action: RetailReceiptAction) {
  const receipt = props.receipt
  if (!receipt || blocked.value || receipt.grants[action] !== true) { return }
  emit('action', { receiptId: receipt.id, orderId: receipt.orderId, action })
}
</script>

<template>
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" aria-label="订单凭证">
    <text class="text-xl font-semibold">
      订单凭证
    </text>
    <text v-if="loading" role="status">
      正在加载凭证…
    </text>
    <text v-if="busy" role="status">
      正在处理凭证请求…
    </text>
    <text v-if="error" role="alert" class="break-words text-[var(--varo-ui-danger-text)]">
      {{ error }}
    </text>
    <view v-if="receipt && summary" class="grid min-w-0 gap-4">
      <text class="break-all">
        订单 {{ receipt.orderId }}
      </text>
      <text class="break-all">
        凭证 {{ receipt.id }}
      </text>
      <text>{{ summary.order }} · {{ summary.payment }}</text>
      <text class="break-words">
        {{ receipt.issuedAt }}
      </text>
      <view v-for="line in receipt.lines" :key="line.id" class="grid gap-1 border-b border-[var(--varo-ui-border-lighter)] pb-3">
        <text class="break-words font-medium">
          {{ line.product.name }}
        </text>
        <text class="tabular-nums">
          数量 {{ line.quantity }} · ¥{{ formatRetailMoney(line.total) }}
        </text>
      </view>
      <text v-if="!receipt.lines.length">
        暂无商品明细
      </text>
      <view v-for="total in receipt.totals" :key="total.id" class="flex flex-wrap justify-between gap-2">
        <text class="break-words">
          {{ total.label }}
        </text><text class="tabular-nums">
          ¥{{ formatRetailMoney(total.amount) }}
        </text>
      </view>
      <text class="text-lg font-semibold tabular-nums">
        实付 {{ summary.paid }}
      </text>
      <view v-for="detail in receipt.details" :key="detail.id" class="grid gap-1">
        <text class="text-[var(--varo-ui-text-regular)]">
          {{ detail.label }}
        </text><text class="break-all">
          {{ detail.value }}
        </text>
      </view>
      <text v-if="receipt.actionReason" class="break-words">
        {{ receipt.actionReason }}
      </text>
      <view class="flex flex-wrap gap-2">
        <VButton v-for="item in actions" :key="item.action" :disabled="item.disabled" @click="request(item.action)">
          {{ item.label }}
        </VButton>
      </view>
    </view>
    <VEmpty v-else-if="!loading" title="暂无凭证" description="订单和支付状态由应用提供" />
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
