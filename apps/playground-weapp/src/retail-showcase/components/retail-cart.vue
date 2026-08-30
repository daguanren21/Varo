<script setup lang="ts">
import type { PropType } from 'wevu'
import type { RetailCartLine } from '../../lib/retail'
import { computed } from 'wevu'
import VEmpty from '../../components/ui/empty.vue'
import InputNumber from '../../components/ui/input-number.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VCheckbox from '../../components/ui/v-checkbox.vue'
import VImage from '../../components/ui/v-image.vue'
import { formatRetailMoney, normalizeRetailProduct } from '../../lib/retail'

const props = defineProps({
  items: { type: null as unknown as PropType<RetailCartLine[]>, default: () => [] },
  selectedCount: { type: null as unknown as PropType<number>, default: 0 },
  total: { type: null as unknown as PropType<number>, default: 0 },
})
const emit = defineEmits<{
  checkout: []
  continue: []
  quantityChange: [payload: { productId: string, quantity: number }]
  select: [payload: { productId: string, selected: boolean }]
  view: [productId: string]
}>()
const safeItems = computed(() => (Array.isArray(props.items) ? props.items : []).map(item => ({
  product: normalizeRetailProduct(item?.product),
  quantity: Number(item?.quantity) || 1,
  selected: Boolean(item?.selected),
})))
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
</script>

<template>
  <view class="grid gap-3 bg-[#f4f6f8] p-3 text-slate-950">
    <view v-if="safeItems.length" class="grid gap-3">
      <VCard v-for="item in safeItems" :key="item.product.id">
        <view class="grid gap-3">
          <view class="grid grid-cols-[auto_88px_minmax(0,1fr)] items-center gap-3">
            <view class="grid h-10 w-10 place-items-center">
              <VCheckbox
                :checked="item.selected"
                aria-label="选择商品"
                @update:checked="emit('select', { productId: item.product.id, selected: $event })"
              />
            </view>
            <view class="h-[88px] w-[88px] overflow-hidden rounded-xl bg-slate-100">
              <VButton
                block
                variant="ghost"
                tone="default"
                class-name="!h-[88px] !min-h-[88px] !w-[88px] !overflow-hidden !rounded-xl !bg-slate-100 !p-0"
                @click="emit('view', item.product.id)"
              >
                <VImage :src="item.product.image" :alt="item.product.name" fit="cover" width="88px" height="88px" />
              </VButton>
            </view>
            <text class="line-clamp-2 min-w-0 text-sm font-bold leading-5">
              {{ item.product.name }}
            </text>
          </view>
          <view class="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <text class="text-lg font-black text-[#f04438]">
              ¥{{ formatRetailMoney(item.product.price) }}
            </text>
            <view class="flex-none">
              <InputNumber
                :value="item.quantity"
                :min="1"
                :max="item.product.stock"
                @update:value="emit('quantityChange', { productId: item.product.id, quantity: $event })"
              />
            </view>
          </view>
        </view>
      </VCard>

      <VCard variant="elevated">
        <view class="flex items-center justify-between gap-3">
          <view class="grid gap-0.5">
            <text class="text-[10px] text-slate-400">
              合计（不含运费）
            </text>
            <text class="text-xl font-black text-[#f04438]">
              ¥{{ formatRetailMoney(safeTotal) }}
            </text>
          </view>
          <VButton size="lg" tone="danger" shape="round" :disabled="safeSelectedCount === 0" @click="emit('checkout')">
            去结算（{{ safeSelectedCount }}）
          </VButton>
        </view>
      </VCard>
    </view>

    <VEmpty v-else title="购物车还是空的" description="去挑选几件喜欢的商品吧">
      <VButton @click="emit('continue')">
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
