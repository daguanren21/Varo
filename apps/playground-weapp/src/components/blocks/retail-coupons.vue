<script setup lang="ts">
import type { RetailCoupon } from './retail-coupons.types'
import { computed } from 'wevu'
import { formatRetailMoney } from '../../lib/retail'
import VEmpty from '../ui/empty.vue'
import VButton from '../ui/v-button.vue'

defineOptions({ properties: { selectedId: { type: null, value: null }, items: { type: Array, value: [] } } })
const props = withDefaults(defineProps<{
  items: RetailCoupon[]
  selectedId?: string | null
  loading?: boolean
  disabled?: boolean
  busy?: boolean
  error?: string
}>(), { items: () => [], loading: false, disabled: false, busy: false, error: '' })
const emit = defineEmits<{ claim: [id: string], select: [id: string] }>()
const statusLabels = { available: '可领取', owned: '已领取', used: '已使用', expired: '已过期' }
const blocked = computed(() => props.loading || props.disabled || props.busy)
function allowed(item: RetailCoupon, action: 'claim' | 'select') {
  return !blocked.value && !item.disabled && !item.busy && item.eligible
    && (action === 'claim' ? item.status === 'available' && item.canClaim : item.status === 'owned' && item.canSelect && props.selectedId !== item.id)
}
const rows = computed(() => props.items.map(item => ({ ...item, amountLabel: `¥${formatRetailMoney(item.amount)}`, statusLabel: statusLabels[item.status], claimLabel: `领取 ${item.title}`, selectLabel: `选择 ${item.title}`, selected: props.selectedId === item.id, claimDisabled: !allowed(item, 'claim'), selectDisabled: !allowed(item, 'select') })))
function request(id: string, action: 'claim' | 'select') {
  const item = props.items.find(item => item.id === id)
  if (!item || !allowed(item, action)) { return }
  if (action === 'claim') { emit('claim', id) }
  else { emit('select', id) }
}
</script>

<template>
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" aria-label="优惠券">
    <text class="text-xl font-semibold">
      优惠券
    </text>
    <text v-if="loading" role="status">
      正在加载优惠券…
    </text>
    <text v-if="busy" role="status">
      正在处理优惠券请求…
    </text>
    <text v-if="error" class="break-words text-[var(--varo-ui-danger-text)]" role="alert">
      {{ error }}
    </text>
    <view v-for="item in rows" :key="item.id" class="grid min-w-0 gap-2 border-b border-[var(--varo-ui-border-lighter)] pb-4">
      <text class="break-words font-semibold">
        {{ item.title }}
      </text>
      <text class="text-xl font-semibold tabular-nums">
        {{ item.amountLabel }}
      </text>
      <text class="break-words">
        {{ item.description }}
      </text>
      <text class="break-words text-[var(--varo-ui-text-regular)]">
        {{ item.validity }}
      </text>
      <text>{{ item.statusLabel }}</text>
      <text v-if="!item.eligible">
        当前不可用
      </text>
      <text v-if="item.reason" class="break-words">
        {{ item.reason }}
      </text>
      <text v-if="item.selected">
        当前已选
      </text>
      <view class="flex flex-wrap gap-2">
        <VButton v-if="item.status === 'available'" :aria-label="item.claimLabel" :disabled="item.claimDisabled" :loading="item.busy" @click="request(item.id, 'claim')">
          领取
        </VButton>
        <VButton v-else :aria-label="item.selectLabel" :disabled="item.selectDisabled" :loading="item.busy" @click="request(item.id, 'select')">
          选择使用
        </VButton>
      </view>
    </view>
    <VEmpty v-if="!items.length && !loading" title="暂无优惠券" description="优惠资格及领取结果由应用提供" />
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
