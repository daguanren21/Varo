<script setup lang="ts">
import type { RetailFilterCategory, RetailFilterSortOption, RetailFilterValue } from '../../components/blocks/retail-filters.types'
import { computed, shallowRef } from 'wevu'
import RetailFilters from '../../components/blocks/retail-filters.vue'
import VButton from '../../components/ui/v-button.vue'
import { formatRetailMoney } from '../../lib/retail'
import { demoProducts, longRetailCopy } from './retail-demo-data'
import RetailDemoStates from './RetailDemoStates.vue'

const mode = shallowRef('ready')
const open = shallowRef(false)
const defaults: RetailFilterValue = { sort: 'recommended', categories: [], minPrice: 0, maxPrice: 50000, availability: 'all' }
const committed = shallowRef<RetailFilterValue>({ ...defaults, categories: [] })
const draft = shallowRef<RetailFilterValue>({ ...defaults, categories: [] })
const error = shallowRef('')
const result = shallowRef('尚未提交筛选；本地结果：4 件')
const categoryOptions: RetailFilterCategory[] = [
  { id: 'home', label: '家居用品' },
  { id: 'digital', label: '数码用品' },
  { id: 'restricted', label: '暂不可配送分类' },
  { id: 'archived', label: '已停用分类', disabled: true },
]
const sorts: RetailFilterSortOption[] = [
  { value: 'recommended', label: '推荐排序' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'newest', label: '最新上架', disabled: true },
]
const categories = computed(() => mode.value === 'empty' ? [] : categoryOptions.map(item => ({ ...item, label: mode.value === 'long' && item.id === 'home' ? `家居用品：${longRetailCopy}` : item.label })))
const visibleSorts = computed(() => mode.value === 'empty' ? [] : sorts)
const shownError = computed(() => mode.value === 'error' ? '本地筛选选项读取失败，保留已有草稿。' : error.value)
function equal(a: RetailFilterValue, b: RetailFilterValue) {
  return a.sort === b.sort && a.minPrice === b.minPrice && a.maxPrice === b.maxPrice && a.availability === b.availability && a.categories.length === b.categories.length && a.categories.every(id => b.categories.includes(id))
}
const canApply = computed(() => !equal(draft.value, committed.value))
const canReset = computed(() => !equal(draft.value, defaults))
const filtered = computed(() => {
  const value = committed.value
  const rows = demoProducts.filter(product => (!value.categories.length || value.categories.includes(product.category)) && product.price >= value.minPrice && product.price <= value.maxPrice && (value.availability === 'all' || product.stock > 0))
  if (value.sort === 'price-asc') { rows.sort((a, b) => a.price - b.price) }
  if (value.sort === 'price-desc') { rows.sort((a, b) => b.price - a.price) }
  return rows
})
const summary = computed(() => `已提交：${committed.value.sort} / ${committed.value.categories.join(',') || '全部分类'} / ${committed.value.minPrice}–${committed.value.maxPrice} 分 / ${committed.value.availability}`)
function begin() { draft.value = { ...committed.value, categories: [...committed.value.categories] }; error.value = ''; open.value = true }
function edit(value: RetailFilterValue) {
  if (!open.value || ['loading', 'disabled', 'busy'].includes(mode.value)) { return }
  draft.value = value
  error.value = ''
}
function reset() { if (canReset.value && !['loading', 'disabled', 'busy'].includes(mode.value)) { draft.value = { ...defaults, categories: [] }; error.value = '' } }
function cancel() { open.value = false; draft.value = { ...committed.value, categories: [...committed.value.categories] }; error.value = ''; result.value = `已取消草稿；本地结果：${filtered.value.length} 件` }
function apply(value: RetailFilterValue) {
  if (!open.value || ['loading', 'disabled', 'busy'].includes(mode.value) || equal(value, committed.value)) { return }
  if (!Number.isInteger(value.minPrice) || !Number.isInteger(value.maxPrice) || value.minPrice < 0 || value.maxPrice > 50000 || value.minPrice > value.maxPrice || !sorts.some(option => option.value === value.sort && !option.disabled) || value.categories.some(id => !categoryOptions.some(option => option.id === id && !option.disabled))) {
    error.value = '应用拒绝无效筛选，已提交结果未改变。'
    return
  }
  if (value.categories.includes('restricted')) { error.value = '应用拒绝：此分类暂不可配送。草稿已保留，结果未改变。'; return }
  committed.value = { ...value, categories: [...value.categories] }
  open.value = false
  error.value = ''
  result.value = `应用已接受筛选；本地结果：${filtered.value.length} 件`
}
</script>

<template>
  <view class="grid gap-4">
    <RetailDemoStates :mode="mode" @change="mode = $event" />
    <VButton @click="begin">
      打开商品筛选
    </VButton>
    <text data-retail-result="filters" role="status">
      {{ result }}
    </text>
    <text data-retail-committed="filters" class="break-words">
      {{ summary }}
    </text>
    <view v-for="product in filtered" :key="product.id" class="grid gap-1 border-b border-[var(--varo-ui-border-lighter)] pb-3" data-retail-filter-product="true">
      <text>{{ product.name }}</text><text>¥{{ formatRetailMoney(product.price) }} · 库存 {{ product.stock }}</text>
    </view>
    <text v-if="!filtered.length">
      没有符合条件的本地商品
    </text>
    <RetailFilters :open="open" :draft="draft" :categories="categories" :sorts="visibleSorts" :price-limit="50000" :can-apply="canApply" :can-reset="canReset" :loading="mode === 'loading'" :disabled="mode === 'disabled'" :busy="mode === 'busy'" :error="shownError" @draftChange="edit" @apply="apply" @reset="reset" @cancel="cancel" />
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
