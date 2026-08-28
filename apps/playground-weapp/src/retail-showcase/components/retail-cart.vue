<script setup lang="ts">
import type { RetailCartLine } from '../../lib/retail'
import VEmpty from '../../components/ui/empty.vue'
import InputNumber from '../../components/ui/input-number.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VCheckbox from '../../components/ui/v-checkbox.vue'
import VImage from '../../components/ui/v-image.vue'
import { formatRetailMoney } from '../../lib/retail'

withDefaults(
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
  checkout: []
  continue: []
  quantityChange: [payload: { productId: string, quantity: number }]
  select: [payload: { productId: string, selected: boolean }]
  view: [productId: string]
}>()
</script>

<template>
  <view class="grid gap-3 bg-[#f4f6f8] p-3 text-slate-950">
    <view v-if="items.length" class="grid gap-3">
      <VCard v-for="item in items" :key="item.product.id" class-name="grid grid-cols-[auto_88px_minmax(0,1fr)] gap-3">
        <VCheckbox
          :checked="item.selected"
          aria-label="选择商品"
          @update:checked="emit('select', { productId: item.product.id, selected: $event })"
        />
        <VButton
          variant="ghost"
          tone="default"
          class-name="!h-auto !min-h-0 !overflow-hidden !rounded-xl !bg-slate-100 !p-0"
          @click="emit('view', item.product.id)"
        >
          <VImage :src="item.product.image" :alt="item.product.name" fit="cover" width="88px" height="88px" />
        </VButton>
        <view class="grid min-w-0 content-between gap-2">
          <text class="line-clamp-2 text-xs font-bold leading-[18px]">
            {{ item.product.name }}
          </text>
          <view class="flex items-end justify-between gap-2">
            <text class="text-base font-black text-[#f04438]">
              ¥{{ formatRetailMoney(item.product.price) }}
            </text>
            <InputNumber
              :value="item.quantity"
              :min="1"
              :max="item.product.stock"
              @update:value="emit('quantityChange', { productId: item.product.id, quantity: $event })"
            />
          </view>
        </view>
      </VCard>

      <VCard class-name="flex items-center justify-between gap-3" variant="elevated">
        <view class="grid gap-0.5">
          <text class="text-[10px] text-slate-400">
            合计（不含运费）
          </text>
          <text class="text-xl font-black text-[#f04438]">
            ¥{{ formatRetailMoney(total) }}
          </text>
        </view>
        <VButton size="lg" tone="danger" shape="round" :disabled="selectedCount === 0" @click="emit('checkout')">
          去结算（{{ selectedCount }}）
        </VButton>
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
