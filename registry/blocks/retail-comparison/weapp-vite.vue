<script setup lang="ts">
import type { RetailComparisonEntry, RetailComparisonField } from './retail-comparison.types'
import { computed } from 'wevu'
import { formatRetailMoney } from '../../lib/retail'
import VEmpty from '../ui/empty.vue'
import VButton from '../ui/v-button.vue'
import { RETAIL_COMPARISON_LIMIT } from './retail-comparison.types'

defineOptions({ properties: { items: { type: Array, value: [] }, fields: { type: Array, value: [] } } })
const props = withDefaults(defineProps<{
  items: RetailComparisonEntry[]
  fields: RetailComparisonField[]
  loading?: boolean
  disabled?: boolean
  busy?: boolean
  error?: string
}>(), { items: () => [], fields: () => [], loading: false, disabled: false, busy: false, error: '' })
const emit = defineEmits<{ view: [id: string], remove: [id: string] }>()
const blocked = computed(() => props.loading || props.disabled || props.busy)
const overLimit = computed(() => props.items.length > RETAIL_COMPARISON_LIMIT)
function allowed(item: RetailComparisonEntry, action: 'view' | 'remove') {
  return !blocked.value && !item.disabled && !item.busy && (action === 'view' ? item.canView : item.canRemove)
}
const rows = computed(() => props.items.map(item => ({ ...item, price: `¥${formatRetailMoney(item.product.price)}`, viewLabel: `查看比较商品 ${item.product.name}`, removeLabel: `移出比较 ${item.product.name}`, viewDisabled: !allowed(item, 'view'), removeDisabled: !allowed(item, 'remove') })))
const sections = computed(() => overLimit.value
  ? []
  : props.fields.map(field => ({ ...field, values: props.items.map(item => ({ id: item.product.id, name: item.product.name, value: item.values[field.id] ?? '未提供' })) })))
function request(id: string, action: 'view' | 'remove') {
  const item = props.items.find(item => item.product.id === id)
  if (!item || !allowed(item, action)) { return }
  if (action === 'view') { emit('view', id) }
  else { emit('remove', id) }
}
</script>

<template>
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" aria-label="商品比较">
    <text class="text-xl font-semibold">
      商品比较
    </text>
    <text>手机最多比较 {{ RETAIL_COMPARISON_LIMIT }} 件商品；所有字段逐项纵向展示。</text>
    <text v-if="loading" role="status">
      正在加载比较…
    </text>
    <text v-if="busy" role="status">
      正在处理比较请求…
    </text>
    <text v-if="error" role="alert" class="break-words text-[var(--varo-ui-danger-text)]">
      {{ error }}
    </text>
    <text v-if="overLimit" role="alert" class="text-[var(--varo-ui-danger-text)]">
      已选择 {{ items.length }} 件，超过 {{ RETAIL_COMPARISON_LIMIT }} 件上限。请移出商品后查看字段；未隐藏任何选中商品。
    </text>
    <view v-for="item in rows" :key="item.product.id" class="grid min-w-0 gap-2 border-b border-[var(--varo-ui-border-lighter)] pb-4">
      <text class="break-words font-semibold">
        {{ item.product.name }}
      </text>
      <text class="tabular-nums">
        {{ item.price }}
      </text>
      <text v-if="item.reason" class="break-words">
        {{ item.reason }}
      </text>
      <view class="flex flex-wrap gap-2">
        <VButton variant="outline" :aria-label="item.viewLabel" :disabled="item.viewDisabled" @click="request(item.product.id, 'view')">
          查看商品
        </VButton>
        <VButton variant="outline" :aria-label="item.removeLabel" :disabled="item.removeDisabled" @click="request(item.product.id, 'remove')">
          移出比较
        </VButton>
      </view>
    </view>
    <view v-for="field in sections" :key="field.id" class="grid min-w-0 gap-3 border-b border-[var(--varo-ui-border-lighter)] pb-4">
      <text class="break-words font-semibold">
        {{ field.label }}
      </text>
      <view v-for="value in field.values" :key="value.id" class="grid min-w-0 gap-1">
        <text class="break-words text-[var(--varo-ui-text-regular)]">
          {{ value.name }}
        </text>
        <text class="break-all whitespace-pre-wrap">
          {{ value.value }}
        </text>
      </view>
    </view>
    <text v-if="items.length && !fields.length && !loading">
      暂无比较字段
    </text>
    <VEmpty v-if="!items.length && !loading" title="暂无比较商品" description="由应用选择最多三件商品" />
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
