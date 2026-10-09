<script setup lang="ts">
import type { RetailWishlistEntry } from './retail-wishlist.types'
import { computed } from 'wevu'
import VEmpty from '../ui/empty.vue'
import VButton from '../ui/v-button.vue'
import ProductListItem from './product-list-item.vue'

defineOptions({ properties: { items: { type: Array, value: [] } } })
const props = withDefaults(defineProps<{
  items: RetailWishlistEntry[]
  loading?: boolean
  disabled?: boolean
  busy?: boolean
  error?: string
}>(), { items: () => [], loading: false, disabled: false, busy: false, error: '' })
const emit = defineEmits<{ view: [id: string], remove: [id: string], addToCart: [id: string] }>()
const blocked = computed(() => props.loading || props.disabled || props.busy)
function allowed(item: RetailWishlistEntry, action: 'view' | 'remove' | 'addToCart') {
  if (blocked.value || item.disabled || item.busy) { return false }
  if (action === 'view') { return item.canView }
  if (action === 'remove') { return item.canRemove }
  return item.canAddToCart && item.product.stock > 0
}
const rows = computed(() => props.items.map(item => ({
  id: item.product.id,
  presentation: { id: item.product.id, name: item.product.name, image: item.product.image, price: item.product.price, inventory: item.product.stock, description: item.product.description, badge: item.product.tags.join(' · ') },
  busy: Boolean(item.busy),
  reason: item.reason,
  viewDisabled: !allowed(item, 'view'),
  cartDisabled: !allowed(item, 'addToCart'),
  removeDisabled: !allowed(item, 'remove'),
  removeLabel: `移出收藏 ${item.product.name}`,
})))
function request(id: string, action: 'view' | 'remove' | 'addToCart') {
  const item = props.items.find(item => item.product.id === id)
  if (!item || !allowed(item, action)) { return }
  if (action === 'view') { emit('view', id) }
  else if (action === 'remove') { emit('remove', id) }
  else { emit('addToCart', id) }
}
</script>

<template>
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" aria-label="商品收藏">
    <text class="text-xl font-semibold">
      商品收藏
    </text>
    <text v-if="loading" role="status">
      正在加载收藏…
    </text>
    <text v-if="busy" role="status">
      正在处理收藏请求…
    </text>
    <text v-if="error" role="alert" class="break-words text-[var(--varo-ui-danger-text)]">
      {{ error }}
    </text>
    <view v-for="item in rows" :key="item.id" class="grid min-w-0 gap-3">
      <ProductListItem :item="item.presentation" :view-disabled="item.viewDisabled" :cart-disabled="item.cartDisabled" :loading="item.busy" @select="request(item.id, 'view')" @addToCart="request(item.id, 'addToCart')" />
      <text v-if="item.reason" class="break-words">
        {{ item.reason }}
      </text>
      <VButton variant="outline" :aria-label="item.removeLabel" :disabled="item.removeDisabled" @click="request(item.id, 'remove')">
        移出收藏
      </VButton>
    </view>
    <VEmpty v-if="!items.length && !loading" title="暂无收藏" description="收藏成员由应用维护" />
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
