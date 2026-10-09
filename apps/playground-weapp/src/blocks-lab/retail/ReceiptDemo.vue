<script setup lang="ts">
import type { RetailReceipt, RetailReceiptAction } from '../../components/blocks/retail-receipt.types'
import { computed, shallowRef } from 'wevu'
import RetailReceiptBlock from '../../components/blocks/retail-receipt.vue'
import VButton from '../../components/ui/v-button.vue'
import { demoProducts, longRetailCopy } from './retail-demo-data'
import RetailDemoStates from './RetailDemoStates.vue'

const mode = shallowRef('ready')
const receipt = shallowRef<RetailReceipt>({
  id: 'LOCAL-RECEIPT-1',
  orderId: 'LOCAL-ORDER-1',
  orderStatus: 'completed',
  paymentStatus: 'paid',
  issuedAt: '本地记录时间：2026-10-08 10:00',
  lines: [{ id: 'line-1', product: demoProducts[0]!, quantity: 2, total: 17800 }],
  totals: [{ id: 'items', label: '商品金额', amount: 17800 }, { id: 'delivery', label: '运费', amount: 500 }, { id: 'discount', label: '优惠', amount: -1000 }],
  paidTotal: 17300,
  details: [{ id: 'method', label: '支付来源', value: '注入的本地历史数据；未执行付款' }, { id: 'delivery', label: '配送说明', value: '本地记录，不安排真实配送' }],
  grants: { refund: true, contact: true, download: false },
  actionReason: '未授权下载；退款操作仅变更本地售后状态，不退还真实资金。',
})
const pending = shallowRef(false)
const error = shallowRef('')
const result = shallowRef('尚未请求凭证操作')
const supportOpen = shallowRef(false)
const visibleReceipt = computed(() => mode.value === 'empty' ? null : { ...receipt.value, details: receipt.value.details.map(item => ({ ...item, value: mode.value === 'long' ? longRetailCopy : item.value })) })
const shownError = computed(() => mode.value === 'error' ? '本地凭证读取失败，保留现有订单证据。' : error.value)
function action(payload: { receiptId: string, orderId: string, action: RetailReceiptAction }) {
  if (payload.receiptId !== receipt.value.id || payload.orderId !== receipt.value.orderId || !receipt.value.grants[payload.action] || pending.value || ['loading', 'disabled', 'busy', 'empty'].includes(mode.value)) { return }
  error.value = ''
  if (payload.action === 'refund') { pending.value = true; result.value = '本地售后请求待确认，实付金额未改变' }
  else if (payload.action === 'contact') { supportOpen.value = true; result.value = '已打开本地联系说明，未联系真实商家' }
  else { result.value = '已收到下载意图；未连接文件适配器，未下载文件' }
}
function decide(accept: boolean) {
  if (!pending.value) { return }
  pending.value = false
  if (!accept || !receipt.value.grants.refund) { error.value = '应用拒绝本地售后请求；订单未改变。'; result.value = '售后请求被拒绝'; return }
  receipt.value = { ...receipt.value, orderStatus: 'after-sale', grants: { ...receipt.value.grants, refund: false }, actionReason: '本地售后已登记，不代表资金退款。' }
  result.value = '本地售后已登记；没有执行退款'
}
function grantDownload() { receipt.value = { ...receipt.value, grants: { ...receipt.value.grants, download: true } } }
</script>

<template>
  <view class="grid gap-4">
    <RetailDemoStates :mode="mode" @change="mode = $event" />
    <VButton variant="outline" :disabled="receipt.grants.download || pending" @click="grantDownload">
      授权下载意图
    </VButton>
    <view v-if="pending" class="flex flex-wrap gap-2">
      <VButton @click="decide(true)">
        接受本地售后
      </VButton><VButton variant="outline" @click="decide(false)">
        拒绝本地售后
      </VButton>
    </view>
    <view v-if="supportOpen" class="grid gap-2">
      <text>本地联系说明：请接入应用自有客服渠道。此示例没有发送消息。</text><VButton variant="outline" @click="supportOpen = false">
        关闭联系说明
      </VButton>
    </view>
    <text data-retail-result="receipt" role="status">
      {{ result }}
    </text>
    <RetailReceiptBlock :receipt="visibleReceipt" :loading="mode === 'loading'" :disabled="mode === 'disabled'" :busy="mode === 'busy' || pending" :error="shownError" @action="action" />
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
