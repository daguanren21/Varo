<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { CheckboxValue } from '../ui/checkbox'
import { computed, shallowRef } from 'vue'
import { cn } from '../../lib/cn'
import { VButton } from '../ui/button'
import { VCheckbox, VCheckboxGroup } from '../ui/checkbox'
import { VInputNumber } from '../ui/input-number'
import { VTag } from '../ui/tag'

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
const rootClass = computed(() =>
  cn(
    'box-border w-full min-w-0 max-w-xl bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)] sm:p-6',
    String.raw`[&_.varo-checkbox]:!min-h-11 [&_.varo-checkbox]:!min-w-11 [&_.varo-checkbox]:!max-w-full [&_.varo-checkbox]:!whitespace-normal [&_.varo-checkbox]:!text-left [&_.varo-checkbox]:!text-sm [&_.varo-checkbox]:!leading-5 [&_.varo-checkbox\_\_icon]:!shrink-0 [&_.varo-checkbox\_\_label]:!min-w-0 [&_.varo-checkbox\_\_label]:!break-words`,
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
  <section :class="rootClass" :aria-label="title">
    <header class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 class="m-0 min-w-0 break-words text-xl font-semibold leading-7">
        {{ title }}
      </h2>
      <VTag v-if="activeCount" tone="default" variant="soft" round>
        {{ activeCount }} 项条件
      </VTag>
    </header>

    <div class="grid grid-cols-1 gap-6">
      <fieldset class="m-0 min-w-0 border-0 p-0">
        <legend class="mb-2 text-sm font-semibold leading-6">
          订单状态
        </legend>
        <VCheckboxGroup v-model:value="selectedStatuses" direction="horizontal" class="!gap-x-5 !gap-y-0">
          <VCheckbox
            v-for="status in statuses"
            :key="String(status.value)"
            :value="status.value"
            :label="status.label"
          />
        </VCheckboxGroup>
      </fieldset>

      <fieldset class="m-0 min-w-0 border-0 p-0">
        <legend class="mb-3 text-sm font-semibold leading-6">
          订单金额
        </legend>
        <div class="flex flex-wrap gap-4">
          <div class="grid min-w-0 gap-2 text-sm leading-6 text-[var(--varo-ui-text-regular)]">
            <span>最低金额</span>
            <VInputNumber
              v-model:value="minPrice"
              :min="0"
              :max="9999"
              :step="50"
              input-aria-label="最低金额"
              decrease-aria-label="减少最低金额"
              increase-aria-label="增加最低金额"
            />
          </div>
          <div class="grid min-w-0 gap-2 text-sm leading-6 text-[var(--varo-ui-text-regular)]">
            <span>最高金额</span>
            <VInputNumber
              v-model:value="maxPrice"
              :min="0"
              :max="9999"
              :step="50"
              input-aria-label="最高金额"
              decrease-aria-label="减少最高金额"
              increase-aria-label="增加最高金额"
            />
          </div>
        </div>
        <p v-if="invalidRange" class="mb-0 mt-3 text-sm leading-6 text-[var(--varo-ui-danger-text)]" role="alert">
          最低金额不能高于最高金额
        </p>
      </fieldset>
    </div>

    <footer class="mt-6 grid gap-4 border-t border-[var(--varo-ui-border-lighter)] pt-4">
      <p v-if="resultCount !== undefined" class="m-0 text-sm leading-6 tabular-nums text-[var(--varo-ui-text-regular)]" role="status">
        预计 {{ resultCount }} 条结果
      </p>
      <div class="flex gap-3">
        <VButton tone="default" variant="ghost" class="!min-h-11 !rounded-lg !px-4 !shadow-none" @click="reset">
          重置
        </VButton>
        <VButton
          tone="default"
          color="var(--varo-ui-text)"
          foreground-color="var(--varo-ui-surface)"
          class="!min-h-11 !flex-1 !rounded-lg !shadow-none"
          :disabled="invalidRange"
          :loading="loading"
          loading-text="筛选中…"
          @click="apply"
        >
          应用筛选
        </VButton>
      </div>
    </footer>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
@import '../../styles/varo-icon.css';
@import '../../styles/varo-checkbox.css';
@import '../../styles/varo-input-number.css';
@import '../../styles/varo-tag.css';
</style>
