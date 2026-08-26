<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { VButton } from '../ui/button'
import { VCheckbox, VCheckboxGroup, type CheckboxValue } from '../ui/checkbox'
import { VInputNumber } from '../ui/input-number'
import { VTag } from '../ui/tag'
import { cn, type ClassValue } from '../../lib/cn'

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
      { label: '已完成', value: 'done' }
    ],
    title: '筛选订单'
  }
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
const rootClass = computed(() =>
  cn('w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', props.className)
)

function currentValue(): OrderFilterValue {
  return {
    maxPrice: maxPrice.value,
    minPrice: minPrice.value,
    statuses: [...selectedStatuses.value]
  }
}

function apply() {
  if (invalidRange.value || props.loading) return
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
  <section :class="rootClass" aria-labelledby="order-filter-title">
    <header class="mb-5 flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Orders</p>
        <h2 id="order-filter-title" class="mt-1 text-xl font-bold text-slate-950">{{ title }}</h2>
      </div>
      <VTag v-if="activeCount" tone="primary" variant="soft" round>{{ activeCount }} 项条件</VTag>
    </header>

    <div class="space-y-5">
      <fieldset class="m-0 border-0 p-0">
        <legend class="mb-3 text-sm font-bold text-slate-800">订单状态</legend>
        <VCheckboxGroup v-model:value="selectedStatuses" direction="horizontal">
          <VCheckbox v-for="status in statuses" :key="String(status.value)" :value="status.value">
            {{ status.label }}
          </VCheckbox>
        </VCheckboxGroup>
      </fieldset>

      <fieldset class="m-0 border-0 p-0">
        <legend class="mb-3 text-sm font-bold text-slate-800">订单金额</legend>
        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <label class="grid gap-1.5 text-xs text-slate-500">
            最低金额
            <VInputNumber v-model:value="minPrice" :min="0" :max="9999" :step="50" />
          </label>
          <span class="pt-5 text-slate-400">—</span>
          <label class="grid gap-1.5 text-xs text-slate-500">
            最高金额
            <VInputNumber v-model:value="maxPrice" :min="0" :max="9999" :step="50" />
          </label>
        </div>
        <p v-if="invalidRange" class="mt-2 text-sm text-red-600" role="alert">最低金额不能高于最高金额</p>
      </fieldset>
    </div>

    <footer class="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <p class="m-0 text-sm text-slate-500">
        <template v-if="resultCount !== undefined">预计 {{ resultCount }} 条结果</template>
      </p>
      <div class="flex gap-2">
        <VButton variant="ghost" @click="reset">重置</VButton>
        <VButton :disabled="invalidRange" :loading="loading" loading-text="筛选中..." @click="apply">
          应用筛选
        </VButton>
      </div>
    </footer>
  </section>
</template>
