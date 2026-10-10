<script setup lang="ts">
import type { RetailCoupon } from '../../components/blocks/retail-coupons.types'
import { computed, shallowRef } from 'wevu'
import RetailCoupons from '../../components/blocks/retail-coupons.vue'
import VButton from '../../components/ui/v-button.vue'
import { longRetailCopy } from './retail-demo-data'
import RetailDemoStates from './RetailDemoStates.vue'

const mode = shallowRef('ready')
const items = shallowRef<RetailCoupon[]>([
  { id: 'welcome', title: '新人券', amount: 1000, description: '本地订单减免十元', validity: '本地演示有效期', status: 'available', eligible: true, canClaim: true, canSelect: false },
  { id: 'member', title: '会员券', amount: 2000, description: '由应用提供会员资格', validity: '本地演示有效期', status: 'available', eligible: false, reason: '当前账户无会员资格', canClaim: true, canSelect: false },
  { id: 'owned', title: '已领运费券', amount: 500, description: '当前订单可用', validity: '本地演示有效期', status: 'owned', eligible: true, canClaim: false, canSelect: true },
  { id: 'used', title: '已使用券', amount: 800, description: '已在历史本地订单使用', validity: '不可重复使用', status: 'used', eligible: true, canClaim: false, canSelect: true },
  { id: 'expired', title: '过期券', amount: 600, description: '由应用标记为过期', validity: '已过期', status: 'expired', eligible: true, canClaim: true, canSelect: true },
])
const selectedId = shallowRef<string | null>(null)
const pendingId = shallowRef('')
const error = shallowRef('')
const result = shallowRef('尚未领取或选择')
const visibleItems = computed(() => mode.value === 'empty' ? [] : items.value.map(item => ({ ...item, busy: item.id === pendingId.value, description: mode.value === 'long' ? longRetailCopy : item.description })))
const shownError = computed(() => mode.value === 'error' ? '本地优惠数据读取失败；保留原有券供核对。' : error.value)
const blocked = computed(() => ['loading', 'disabled', 'busy', 'empty'].includes(mode.value))
function claim(id: string) {
  const item = items.value.find(item => item.id === id)
  if (!item || blocked.value || pendingId.value || !item.eligible || !item.canClaim || item.status !== 'available') { return }
  pendingId.value = id
  error.value = ''
  result.value = '本地领取待确认，尚未变更券状态'
}
function accept() {
  const item = items.value.find(item => item.id === pendingId.value)
  if (!item) { return }
  pendingId.value = ''
  if (blocked.value || !item.eligible || !item.canClaim || item.status !== 'available') {
    error.value = '应用拒绝领取：资格已变化，券未领取。'
    result.value = '领取被拒绝'
    return
  }
  items.value = items.value.map(current => current.id === item.id ? { ...current, status: 'owned', canClaim: false, canSelect: true } : current)
  result.value = `本地已领取：${item.title}`
}
function revoke() {
  items.value = items.value.map(item => item.id === pendingId.value ? { ...item, eligible: false, reason: '应用在确认前撤销资格' } : item)
}
function cancel() { pendingId.value = ''; result.value = '已取消本地领取，券未变更' }
function select(id: string) {
  const item = items.value.find(item => item.id === id)
  if (!item || blocked.value || pendingId.value || !item.eligible || !item.canSelect || item.status !== 'owned' || selectedId.value === id) { return }
  selectedId.value = id
  error.value = ''
  result.value = `本地已选择：${item.title}`
}
</script>

<template>
  <view class="grid gap-4">
    <RetailDemoStates :mode="mode" @change="mode = $event" />
    <view v-if="pendingId" class="grid gap-2">
      <text>应用持有待处理领取</text><view class="flex flex-wrap gap-2">
        <VButton @click="accept">
          接受本地领取
        </VButton><VButton variant="outline" @click="revoke">
          撤销待处理优惠资格
        </VButton><VButton variant="outline" @click="cancel">
          取消本地领取
        </VButton>
      </view>
    </view>
    <text data-retail-result="coupons" role="status">
      {{ result }}
    </text>
    <RetailCoupons :items="visibleItems" :selected-id="selectedId" :loading="mode === 'loading'" :disabled="mode === 'disabled'" :busy="mode === 'busy' || !!pendingId" :error="shownError" @claim="claim" @select="select" />
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
