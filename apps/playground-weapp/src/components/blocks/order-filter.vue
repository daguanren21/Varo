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
  cn(
    'box-border w-full min-w-0 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]',
    props.className,
  ),
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
  <view :class="rootClass" :aria-label="title">
    <view class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <text class="block min-w-0 break-words text-xl font-semibold leading-7">
        {{ title }}
      </text>
      <VTag v-if="activeCount" tone="default" variant="soft" round>
        {{ activeCount }} 项条件
      </VTag>
    </view>

    <view class="grid grid-cols-1 gap-6">
      <view class="min-w-0" role="group" aria-label="订单状态">
        <text class="mb-2 block text-sm font-semibold leading-6">
          订单状态
        </text>
        <view class="flex min-w-0 flex-wrap gap-x-5">
          <VCheckbox
            v-for="status in statusOptions"
            :key="String(status.value)"
            :checked="statusChecked(status.value)"
            :value="status.value"
            :label="status.label"
            :aria-label="status.label"
            class="min-w-0 max-w-full"
            @update:checked="updateStatus(status.value, $event)"
          />
        </view>
      </view>

      <view class="min-w-0" role="group" aria-label="订单金额">
        <text class="mb-3 block text-sm font-semibold leading-6">
          订单金额
        </text>
        <view class="flex flex-wrap gap-4">
          <view class="grid min-w-0 gap-2 text-sm leading-6 text-[var(--varo-ui-text-regular)]">
            <text>最低金额</text>
            <VInputNumber
              v-model:value="minPrice"
              :min="0"
              :max="9999"
              :step="50"
              input-aria-label="最低金额"
              decrease-aria-label="减少最低金额"
              increase-aria-label="增加最低金额"
            />
          </view>
          <view class="grid min-w-0 gap-2 text-sm leading-6 text-[var(--varo-ui-text-regular)]">
            <text>最高金额</text>
            <VInputNumber
              v-model:value="maxPrice"
              :min="0"
              :max="9999"
              :step="50"
              input-aria-label="最高金额"
              decrease-aria-label="减少最高金额"
              increase-aria-label="增加最高金额"
            />
          </view>
        </view>
        <text v-if="invalidRange" class="mt-3 block text-sm leading-6 text-[var(--varo-ui-danger-text)]" role="alert">
          最低金额不能高于最高金额
        </text>
      </view>
    </view>

    <view class="mt-6 grid gap-4 border-t border-[var(--varo-ui-border-lighter)] pt-4">
      <text v-if="resultCount !== undefined" class="block text-sm leading-6 tabular-nums text-[var(--varo-ui-text-regular)]" role="status">
        预计 {{ resultCount }} 条结果
      </text>
      <view class="flex gap-3">
        <VButton tone="default" variant="ghost" class-name="!min-h-11 !rounded-lg !px-4 !shadow-none" @click="reset">
          重置
        </VButton>
        <VButton
          block
          tone="default"
          color="var(--varo-ui-text)"
          foreground-color="var(--varo-ui-surface)"
          class="min-w-0 flex-1"
          class-name="!min-h-11 !rounded-lg !shadow-none"
          :disabled="invalidRange"
          :loading="loading"
          loading-text="筛选中…"
          @click="apply"
        >
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
