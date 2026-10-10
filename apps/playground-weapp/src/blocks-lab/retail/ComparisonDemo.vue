<script setup lang="ts">
import type { RetailComparisonEntry, RetailComparisonField } from '../../components/blocks/retail-comparison.types'
import { computed, shallowRef } from 'wevu'
import RetailComparison from '../../components/blocks/retail-comparison.vue'
import VButton from '../../components/ui/v-button.vue'
import { demoProducts, longRetailCopy } from './retail-demo-data'
import RetailDemoStates from './RetailDemoStates.vue'

const mode = shallowRef('ready')
const allEntries: RetailComparisonEntry[] = demoProducts.map(product => ({ product, values: { category: product.category, stock: String(product.stock), care: product.description }, canView: product.id !== 'link', canRemove: product.id !== 'link', reason: product.id === 'link' ? '应用锁定此比较成员。' : '' }))
const items = shallowRef(allEntries.slice(0, 3))
const fields: RetailComparisonField[] = [{ id: 'category', label: '分类' }, { id: 'stock', label: '库存' }, { id: 'care', label: '完整使用与维护说明' }, { id: 'warranty', label: '保修说明' }]
const result = shallowRef('本地比较数量：3')
const selectedId = shallowRef('')
const selected = computed(() => demoProducts.find(item => item.id === selectedId.value))
const overflowDisabled = computed(() => items.value.some(item => item.product.id === 'earbuds'))
const visibleItems = computed(() => mode.value === 'empty' ? [] : items.value.map(item => ({ ...item, values: { ...item.values, care: mode.value === 'long' ? longRetailCopy : item.values.care! } })))
const shownError = computed(() => mode.value === 'error' ? '本地比较读取失败，保留已知商品和字段。' : '')
function overflow() {
  if (overflowDisabled.value) { return }
  items.value = [...items.value, allEntries[3]!]
  result.value = `本地比较数量：${items.value.length}`
}
function request(id: string, action: 'view' | 'remove') {
  const item = items.value.find(item => item.product.id === id)
  if (!item || ['loading', 'disabled', 'busy', 'empty'].includes(mode.value) || (action === 'view' ? !item.canView : !item.canRemove)) { return }
  if (action === 'view') { selectedId.value = id; result.value = `本地查看比较商品：${item.product.name}`; return }
  items.value = items.value.filter(item => item.product.id !== id)
  result.value = `本地比较数量：${items.value.length}`
}
</script>

<template>
  <view class="grid gap-4">
    <RetailDemoStates :mode="mode" @change="mode = $event" />
    <VButton variant="outline" :disabled="overflowDisabled" @click="overflow">
      注入第四件比较商品
    </VButton>
    <view v-if="selected" class="grid gap-2">
      <text class="break-words">
        本地比较详情：{{ selected.name }} · {{ selected.description }}
      </text><VButton variant="outline" @click="selectedId = ''">
        关闭比较详情
      </VButton>
    </view>
    <text data-retail-result="comparison" role="status">
      {{ result }}
    </text>
    <RetailComparison :items="visibleItems" :fields="fields" :loading="mode === 'loading'" :disabled="mode === 'disabled'" :busy="mode === 'busy'" :error="shownError" @view="request($event, 'view')" @remove="request($event, 'remove')" />
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
