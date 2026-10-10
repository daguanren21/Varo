<script setup lang="ts">
import type { RetailAvailability, RetailFilterCategory, RetailFilterSortOption, RetailFilterValue, RetailSort } from './retail-filters.types'
import { computed } from 'wevu'
import VInputNumber from '../ui/input-number.vue'
import VButton from '../ui/v-button.vue'
import VCheckbox from '../ui/v-checkbox.vue'
import VDrawer from '../ui/v-drawer.vue'

defineOptions({ properties: {
  open: { type: null, value: null },
  draft: { type: Object, value: { sort: 'recommended', categories: [], minPrice: 0, maxPrice: 0, availability: 'all' } },
  categories: { type: Array, value: [] },
  sorts: { type: Array, value: [] },
} })
const props = withDefaults(defineProps<{
  open: boolean
  draft: RetailFilterValue
  categories: RetailFilterCategory[]
  sorts: RetailFilterSortOption[]
  priceLimit: number
  canApply: boolean
  canReset: boolean
  loading?: boolean
  disabled?: boolean
  busy?: boolean
  error?: string
}>(), {
  draft: () => ({ sort: 'recommended', categories: [], minPrice: 0, maxPrice: 0, availability: 'all' }),
  categories: () => [],
  sorts: () => [],
  priceLimit: 0,
  canApply: false,
  canReset: false,
  loading: false,
  disabled: false,
  busy: false,
  error: '',
})
const emit = defineEmits<{
  draftChange: [draft: RetailFilterValue]
  apply: [draft: RetailFilterValue]
  reset: []
  cancel: []
}>()
const currentOpen = computed(() => props.open === true)
const blocked = computed(() => !currentOpen.value || props.loading || props.disabled || props.busy)
const invalidRange = computed(() => !Number.isInteger(props.draft.minPrice) || !Number.isInteger(props.draft.maxPrice) || props.draft.minPrice < 0 || props.draft.maxPrice > props.priceLimit || props.draft.minPrice > props.draft.maxPrice)
const invalidChoices = computed(() => !props.sorts.some(option => option.value === props.draft.sort && !option.disabled)
  || props.draft.categories.some(id => !props.categories.some(option => option.id === id && !option.disabled)))
const applyDisabled = computed(() => blocked.value || !props.canApply || invalidRange.value || invalidChoices.value)
const resetDisabled = computed(() => blocked.value || !props.canReset)
const categoryRows = computed(() => props.categories.map(option => ({ ...option, checked: props.draft.categories.includes(option.id), unavailable: blocked.value || option.disabled })))
const sortRows = computed(() => props.sorts.map(option => ({ ...option, selected: option.value === props.draft.sort, unavailable: blocked.value || option.disabled || option.value === props.draft.sort })))
const availabilityRows = computed(() => ([{ value: 'all' as const, label: '全部库存' }, { value: 'in-stock' as const, label: '仅看有货' }]).map(option => ({ ...option, selected: option.value === props.draft.availability, unavailable: blocked.value || option.value === props.draft.availability })))
function snapshot(): RetailFilterValue { return { ...props.draft, categories: [...props.draft.categories] } }
function sort(value: RetailSort) {
  if (blocked.value || value === props.draft.sort || !props.sorts.some(option => option.value === value && !option.disabled)) { return }
  emit('draftChange', { ...snapshot(), sort: value })
}
function category(id: string, checked: boolean) {
  if (blocked.value || !props.categories.some(option => option.id === id && !option.disabled) || props.draft.categories.includes(id) === checked) { return }
  emit('draftChange', { ...snapshot(), categories: checked ? [...props.draft.categories, id] : props.draft.categories.filter(value => value !== id) })
}
function price(key: 'minPrice' | 'maxPrice', value: number) {
  if (blocked.value || !Number.isInteger(value) || value < 0 || value > props.priceLimit || value === props.draft[key]) { return }
  emit('draftChange', { ...snapshot(), [key]: value })
}
function availability(value: RetailAvailability) {
  if (blocked.value || value === props.draft.availability) { return }
  emit('draftChange', { ...snapshot(), availability: value })
}
function apply() { if (!applyDisabled.value) { emit('apply', snapshot()) } }
function reset() { if (!resetDisabled.value) { emit('reset') } }
function cancel() { if (currentOpen.value) { emit('cancel') } }
function openChange(open: boolean) { if (!open) { cancel() } }
</script>

<template>
  <VDrawer :open="currentOpen" placement="bottom" :round="true" :safe-area-inset-bottom="true" aria-label="商品筛选" @update:open="openChange">
    <view class="box-border grid max-h-[85vh] min-w-0 gap-4 overflow-y-auto bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]">
      <view class="flex flex-wrap items-center justify-between gap-2">
        <text class="text-xl font-semibold">
          商品筛选
        </text><VButton variant="ghost" @click="cancel">
          取消筛选
        </VButton>
      </view>
      <text>修改只影响草稿；应用接受后才更新结果。</text>
      <text v-if="loading" role="status">
        正在加载筛选选项…
      </text>
      <text v-if="busy" role="status">
        等待应用接受筛选…
      </text>
      <text v-if="error" role="alert" class="break-words text-[var(--varo-ui-danger-text)]">
        {{ error }}
      </text>
      <text class="font-semibold">
        排序
      </text>
      <view class="flex flex-wrap gap-2">
        <VButton v-for="option in sortRows" :key="option.value" variant="outline" :disabled="option.unavailable" @click="sort(option.value)">
          {{ option.label }}<text v-if="option.selected">
            （已选）
          </text>
        </VButton>
      </view>
      <text v-if="!sorts.length && !loading">
        暂无排序选项
      </text>
      <text class="font-semibold">
        分类
      </text>
      <view class="grid gap-2">
        <VCheckbox v-for="option in categoryRows" :key="option.id" :checked="option.checked" :disabled="option.unavailable" :label="option.label" :aria-label="option.label" @update:checked="category(option.id, $event)" />
      </view>
      <text v-if="!categories.length && !loading">
        暂无分类选项
      </text>
      <text class="font-semibold">
        价格（分，100 分 = ¥1）
      </text>
      <view class="grid gap-3">
        <text>最低价格</text><VInputNumber :value="draft.minPrice" :min="0" :max="priceLimit" :step="100" :disabled="blocked" input-aria-label="筛选最低价格" decrease-aria-label="减少筛选最低价格" increase-aria-label="增加筛选最低价格" @change="price('minPrice', $event)" />
        <text>最高价格</text><VInputNumber :value="draft.maxPrice" :min="0" :max="priceLimit" :step="100" :disabled="blocked" input-aria-label="筛选最高价格" decrease-aria-label="减少筛选最高价格" increase-aria-label="增加筛选最高价格" @change="price('maxPrice', $event)" />
      </view>
      <text v-if="invalidRange" role="alert" class="text-[var(--varo-ui-danger-text)]">
        最低价格不能高于最高价格，价格须为允许范围内的整数分。
      </text>
      <text v-if="invalidChoices" role="alert" class="text-[var(--varo-ui-danger-text)]">
        部分选项已不可用，请重新选择或重置草稿。
      </text>
      <view class="flex flex-wrap gap-2">
        <VButton v-for="option in availabilityRows" :key="option.value" variant="outline" :disabled="option.unavailable" @click="availability(option.value)">
          {{ option.label }}<text v-if="option.selected">
            （已选）
          </text>
        </VButton>
      </view>
      <view class="flex flex-wrap gap-2">
        <VButton variant="outline" :disabled="resetDisabled" @click="reset">
          重置草稿
        </VButton><VButton :disabled="applyDisabled" :loading="busy" @click="apply">
          应用商品筛选
        </VButton>
      </view>
    </view>
  </VDrawer>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
