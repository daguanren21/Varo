<script setup lang="ts">
import type { RetailCartLine } from '../../lib/retail'
import { computed } from 'wevu'
import { formatRetailMoney, normalizeRetailProduct } from '../../lib/retail'
import VEmpty from '../ui/empty.vue'
import InputNumber from '../ui/input-number.vue'
import VButton from '../ui/v-button.vue'
import VCheckbox from '../ui/v-checkbox.vue'
import VImage from '../ui/v-image.vue'

const props = withDefaults(
  defineProps<{
    items?: RetailCartLine[]
    selectedCount?: number
    total?: number
  }>(),
  {
    items: () => [],
    selectedCount: 0,
    total: 0,
  },
)
const emit = defineEmits<{
  'checkout': []
  'continue': []
  'quantity-change': [payload: { productId: string, quantity: number }]
  'select': [payload: { productId: string, selected: boolean }]
  'view': [productId: string]
}>()
const safeItems = computed(() => (Array.isArray(props.items) ? props.items : []).map((item) => {
  const product = normalizeRetailProduct(item?.product)
  return {
    product,
    quantity: Number(item?.quantity) || 1,
    selected: Boolean(item?.selected),
    selectionLabel: `选择${product.name}`,
    quantityLabel: `${product.name}的数量`,
    decreaseLabel: `减少${product.name}的数量`,
    increaseLabel: `增加${product.name}的数量`,
  }
}))
const safeSelectedCount = computed(() => {
  if (safeItems.value.length > 0) { return safeItems.value.filter(item => item.selected).length }
  return Number(props.selectedCount) || 0
})
const safeTotal = computed(() => {
  if (safeItems.value.length > 0) {
    return safeItems.value
      .filter(item => item.selected)
      .reduce((total, item) => total + item.product.price * item.quantity, 0)
  }
  return Number(props.total) || 0
})

function changeQuantity(productId: string, quantity: number) {
  // Wevu forwards camelCase names unchanged; the native listener is kebab-case.
  // eslint-disable-next-line vue/custom-event-name-casing
  emit('quantity-change', { productId, quantity })
}
</script>

<template>
  <view class="grid grid-cols-1 gap-6 bg-[var(--varo-ui-surface)] text-sm leading-6 text-[var(--varo-ui-text)]">
    <view class="grid gap-2 px-4 pt-6">
      <text class="text-xl font-semibold leading-7">
        购物车
      </text>
      <text v-if="safeItems.length" class="text-xs leading-5 text-[var(--varo-ui-text-regular)]">
        已选 {{ safeSelectedCount }} 项商品
      </text>
    </view>

    <view v-if="safeItems.length" class="grid gap-6 px-4">
      <view v-for="item in safeItems" :key="item.product.id" class="grid gap-4 border-b border-[var(--varo-ui-border-lighter)] pb-6">
        <view class="grid grid-cols-[44px_minmax(0,1fr)] items-start gap-2">
          <view class="grid h-11 w-11 place-items-center">
            <VCheckbox
              :checked="item.selected"
              :aria-label="item.selectionLabel"
              @update:checked="emit('select', { productId: item.product.id, selected: $event })"
            />
          </view>
          <VButton
            block
            variant="ghost"
            tone="default"
            :aria-label="item.product.name"
            class-name="!min-h-11 !w-full !min-w-0 !rounded-lg !p-0 !text-left !shadow-none"
            @click="emit('view', item.product.id)"
          >
            <view class="grid w-full min-w-0 grid-cols-[72px_minmax(0,1fr)] items-start gap-3">
              <VImage :src="item.product.image" :alt="item.product.name" fit="cover" width="72px" height="72px" radius="8px" />
              <view class="grid min-w-0 grid-cols-1 gap-2">
                <text class="break-words text-sm font-medium leading-6">
                  {{ item.product.name }}
                </text>
                <text class="break-all text-base font-semibold tabular-nums leading-6">
                  ¥{{ formatRetailMoney(item.product.price) }}
                </text>
              </view>
            </view>
          </VButton>
        </view>
        <view class="flex flex-wrap items-center justify-between gap-3 pl-[52px]">
          <text class="text-xs leading-6 text-[var(--varo-ui-text-regular)]">
            数量
          </text>
          <InputNumber
            :value="item.quantity"
            :min="1"
            :max="item.product.stock"
            :input-aria-label="item.quantityLabel"
            :decrease-aria-label="item.decreaseLabel"
            :increase-aria-label="item.increaseLabel"
            @change="changeQuantity(item.product.id, $event)"
          />
        </view>
      </view>
    </view>

    <view v-if="safeItems.length" class="sticky bottom-0 z-10 grid gap-4 border-t border-[var(--varo-ui-border-lighter)] bg-[var(--varo-ui-surface)] p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <view class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-4">
        <text class="text-sm leading-6 text-[var(--varo-ui-text-regular)]">
          合计（不含运费）
        </text>
        <text class="break-all text-right text-xl font-semibold tabular-nums leading-7">
          ¥{{ formatRetailMoney(safeTotal) }}
        </text>
      </view>
      <VButton block size="lg" tone="default" class-name="!min-h-12 !rounded-lg !bg-[var(--varo-ui-text)] !text-sm !text-[var(--varo-ui-surface)] !shadow-none" :disabled="safeSelectedCount === 0" @click="emit('checkout')">
        去结算（{{ safeSelectedCount }}）
      </VButton>
    </view>

    <VEmpty v-else title="购物车还是空的" description="去挑选几件喜欢的商品吧">
      <VButton size="lg" tone="default" class-name="!min-h-12 !rounded-lg !bg-[var(--varo-ui-text)] !text-sm !text-[var(--varo-ui-surface)] !shadow-none" @click="emit('continue')">
        去逛逛
      </VButton>
    </VEmpty>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
