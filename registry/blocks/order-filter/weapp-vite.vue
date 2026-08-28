<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { CheckboxValue } from '../ui/selection-context'
import { computed, shallowRef } from 'wevu'
import { cn } from '../../lib/cn'
import VInputNumber from '../ui/input-number.vue'
import VTag from '../ui/tag.vue'
import VButton from '../ui/v-button.vue'
import VCheckbox from '../ui/v-checkbox.vue'

interface OrderStatusOption {
  label: string
  value: CheckboxValue
}

interface OrderFilterValue {
  maxPrice: number
  minPrice: number
  statuses: CheckboxValue[]
}

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    initialValue?: Partial<OrderFilterValue>
    loading?: boolean
    resultCount?: number
    statuses?: OrderStatusOption[]
    title?: string
  }>(),
  {
    initialValue: () => ({}),
    loading: false,
    resultCount: undefined,
    statuses: () => [
      { label: '待付款', value: 'pending_payment' },
      { label: '待发货', value: 'pending_ship' },
      { label: '已完成', value: 'done' },
    ],
    title: '筛选订单',
  },
)

const emit = defineEmits<{
  apply: [filters: OrderFilterValue]
  reset: [filters: OrderFilterValue]
}>()

const maxPrice = shallowRef(props.initialValue.maxPrice ?? 9999)
const minPrice = shallowRef(props.initialValue.minPrice ?? 0)
const selectedStatuses = shallowRef<CheckboxValue[]>([...(props.initialValue.statuses ?? [])])
const invalidRange = computed(() => minPrice.value > maxPrice.value)
const activeCount = computed(() => selectedStatuses.value.length + Number(minPrice.value > 0) + Number(maxPrice.value < 9999))
const statusOptions = computed(() => Array.isArray(props.statuses) ? props.statuses : [])
const rootClass = computed(() =>
  cn('w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', props.className),
)

function currentValue(): OrderFilterValue {
  return {
    maxPrice: maxPrice.value,
    minPrice: minPrice.value,
    statuses: [...selectedStatuses.value],
  }
}

function statusChecked(value: CheckboxValue) {
  return selectedStatuses.value.includes(value)
}

function updateStatus(value: CheckboxValue, checked: boolean) {
  selectedStatuses.value = checked
    ? [...selectedStatuses.value, value]
    : selectedStatuses.value.filter(current => current !== value)
}

function apply() {
  if (invalidRange.value || props.loading) { return }
  emit('apply', currentValue())
}

function reset() {
  maxPrice.value = 9999
  minPrice.value = 0
  selectedStatuses.value = []
  emit('reset', currentValue())
}
</script>

<template>
  <view :class="rootClass" aria-labelledby="order-filter-title">
    <view class="mb-5 flex items-center justify-between gap-3">
      <view>
        <text class="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
          Orders
        </text>
        <text id="order-filter-title" class="mt-1 block text-xl font-bold text-slate-950">
          {{ title }}
        </text>
      </view>
      <VTag v-if="activeCount" tone="primary" variant="soft" round>
        {{ activeCount }} 项条件
      </VTag>
    </view>

    <view class="grid gap-5">
      <view>
        <text class="mb-3 block text-sm font-bold text-slate-800">
          订单状态
        </text>
        <view class="flex flex-wrap gap-3">
          <VCheckbox
            v-for="status in statusOptions"
            :key="String(status.value)"
            :checked="statusChecked(status.value)"
            :value="status.value"
            @update:checked="updateStatus(status.value, $event)"
          >
            {{ status.label }}
          </VCheckbox>
        </view>
      </view>

      <view>
        <text class="mb-3 block text-sm font-bold text-slate-800">
          订单金额
        </text>
        <view class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <view class="grid gap-1.5 text-xs text-slate-500">
            <text>最低金额</text>
            <VInputNumber v-model:value="minPrice" :min="0" :max="9999" :step="50" />
          </view>
          <text class="pt-5 text-slate-400">
            —
          </text>
          <view class="grid gap-1.5 text-xs text-slate-500">
            <text>最高金额</text>
            <VInputNumber v-model:value="maxPrice" :min="0" :max="9999" :step="50" />
          </view>
        </view>
        <text v-if="invalidRange" class="mt-2 block text-sm text-red-600" role="alert">
          最低金额不能高于最高金额
        </text>
      </view>
    </view>

    <view class="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <text class="text-sm text-slate-500">
        <template v-if="resultCount !== undefined">
          预计 {{ resultCount }} 条结果
        </template>
      </text>
      <view class="flex gap-2">
        <VButton variant="ghost" @click="reset">
          重置
        </VButton>
        <VButton :disabled="invalidRange" :loading="loading" loading-text="筛选中..." @click="apply">
          应用筛选
        </VButton>
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
