<script setup lang="ts">
import type { RetailWishlistEntry } from '../../components/blocks/retail-wishlist.types'
import { computed, shallowRef } from 'wevu'
import RetailWishlist from '../../components/blocks/retail-wishlist.vue'
import VButton from '../../components/ui/v-button.vue'
import { demoProducts, longRetailCopy } from './retail-demo-data'
import RetailDemoStates from './RetailDemoStates.vue'

const mode = shallowRef('ready')
const items = shallowRef<RetailWishlistEntry[]>(demoProducts.slice(0, 3).map(product => ({ product, canView: product.id !== 'link', canRemove: product.id !== 'link', canAddToCart: product.id !== 'link', reason: product.id === 'link' ? '应用未授权查看、移除或加购；库存为 2。' : '' })))
const cart = shallowRef<Record<string, number>>({})
const error = shallowRef('')
const rejectNext = shallowRef(false)
const selectedId = shallowRef('')
const result = shallowRef('本地购物袋数量：0')
const visibleItems = computed(() => mode.value === 'empty' ? [] : items.value.map(item => ({ ...item, product: { ...item.product, description: mode.value === 'long' ? longRetailCopy : item.product.description } })))
const selected = computed(() => demoProducts.find(item => item.id === selectedId.value))
const shownError = computed(() => mode.value === 'error' ? '本地收藏读取失败，保留已知成员。' : error.value)
const rejectLabel = computed(() => rejectNext.value ? '取消下次应用拒绝' : '拒绝下一次收藏操作')
function request(id: string, action: 'view' | 'remove' | 'add') {
  const item = items.value.find(item => item.product.id === id)
  if (!item || ['loading', 'disabled', 'busy', 'empty'].includes(mode.value) || item.disabled || item.busy) { return }
  if (action === 'view' ? !item.canView : action === 'remove' ? !item.canRemove : !item.canAddToCart || item.product.stock <= 0) { return }
  if (rejectNext.value) { rejectNext.value = false; error.value = '应用拒绝本次操作；收藏与购物袋未改变。'; return }
  error.value = ''
  if (action === 'view') { selectedId.value = id; result.value = `本地查看：${item.product.name}`; return }
  if (action === 'remove') { items.value = items.value.filter(value => value.product.id !== id); result.value = `本地已移出收藏：${item.product.name}`; return }
  const quantity = cart.value[id] ?? 0
  if (quantity >= item.product.stock) { error.value = '应用拒绝加购：本地购物袋数量已达库存。'; return }
  cart.value = { ...cart.value, [id]: quantity + 1 }
  result.value = `本地购物袋数量：${Object.values(cart.value).reduce((total, value) => total + value, 0)}`
}
</script>

<template>
  <view class="grid gap-4">
    <RetailDemoStates :mode="mode" @change="mode = $event" />
    <VButton variant="outline" @click="rejectNext = !rejectNext">
      {{ rejectLabel }}
    </VButton>
    <view v-if="selected" class="grid gap-2">
      <text class="break-words">
        本地查看内容：{{ selected.name }} · {{ selected.description }}
      </text><VButton variant="outline" @click="selectedId = ''">
        关闭本地商品内容
      </VButton>
    </view>
    <text data-retail-result="wishlist" role="status">
      {{ result }}
    </text>
    <RetailWishlist :items="visibleItems" :loading="mode === 'loading'" :disabled="mode === 'disabled'" :busy="mode === 'busy'" :error="shownError" @view="request($event, 'view')" @remove="request($event, 'remove')" @addToCart="request($event, 'add')" />
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
