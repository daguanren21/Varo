<script setup lang="ts">
import type { PropType } from 'wevu'
import type { RetailProduct } from '../../lib/retail'
import { computed, shallowRef } from 'wevu'
import VBadge from '../../components/ui/badge.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VImage from '../../components/ui/v-image.vue'
import VInput from '../../components/ui/v-input.vue'
import { formatRetailMoney, normalizeRetailProduct } from '../../lib/retail'

interface RetailCategory {
  id: string
  label: string
}

const props = defineProps({
  banner: { type: null as unknown as PropType<string>, default: '' },
  cartCount: { type: null as unknown as PropType<number>, default: 0 },
  categories: { type: null as unknown as PropType<RetailCategory[]>, default: () => [] },
  products: { type: null as unknown as PropType<RetailProduct[]>, default: () => [] },
  title: { type: String, default: 'Varo 零售生活馆' },
})

const emit = defineEmits<{
  add: [product: RetailProduct]
  cart: []
  category: [category: RetailCategory]
  search: [keyword: string]
  select: [product: RetailProduct]
}>()

const keyword = shallowRef('')
const bannerSource = computed(() => props.banner || '')
const categoryItems = computed(() => (Array.isArray(props.categories) ? props.categories : []).map(category => ({
  id: String(category?.id ?? ''),
  initial: String(category?.label ?? '').slice(0, 1),
  label: String(category?.label ?? ''),
})))
const displayTitle = computed(() => props.title || 'Varo 零售生活馆')
const featured = computed(() => (Array.isArray(props.products) ? props.products : []).slice(0, 8).map((product) => {
  const normalized = normalizeRetailProduct(product)
  return {
    ...normalized,
    priceLabel: formatRetailMoney(normalized.price),
    primaryTag: normalized.tags[0] ?? '',
  }
}))
const safeCartCount = computed(() => Number(props.cartCount) || 0)

function search() {
  emit('search', keyword.value.trim())
}
</script>

<template>
  <view class="grid gap-4 bg-[#f4f6f8] p-3 text-slate-950">
    <view class="flex items-center justify-between gap-3">
      <view class="grid gap-0.5">
        <text class="text-[9px] font-black tracking-[0.16em] text-teal-700">
          VARO RETAIL
        </text>
        <text class="text-xl font-black">
          {{ displayTitle }}
        </text>
      </view>
      <VButton size="sm" shape="round" tone="default" class-name="relative !h-10 !min-h-10 !w-10 !p-0 !bg-slate-950 !text-[9px] !text-white" @click="emit('cart')">
        购物车
        <VBadge v-if="safeCartCount" :content="safeCartCount" class="absolute -right-1 -top-1" />
      </VButton>
    </view>

    <view class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
      <VInput :value="keyword" placeholder="搜索商品、品牌或活动" clearable @update:value="keyword = $event" />
      <VButton size="sm" @click="search">
        搜索
      </VButton>
    </view>

    <VCard v-if="bannerSource" :padding="false" class-name="overflow-hidden">
      <VImage :src="bannerSource" :alt="displayTitle" fit="cover" width="100%" height="196px" />
    </VCard>

    <VCard>
      <view class="grid grid-cols-5 gap-2 pb-2">
        <VButton
          v-for="category in categoryItems"
          :key="category.id"
          size="sm"
          variant="ghost"
          tone="default"
          class-name="!grid !min-h-18 !w-full !place-items-center !gap-1 !p-0 !pb-2"
          @click="emit('category', category)"
        >
          <text class="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-xs font-black text-teal-700">
            {{ category.initial }}
          </text>
          <text class="text-[10px] font-semibold text-slate-600">
            {{ category.label }}
          </text>
        </VButton>
      </view>
    </VCard>

    <view class="grid grid-cols-2 gap-3">
      <VCard v-for="product in featured" :key="product.id" :padding="false" interactive class-name="overflow-hidden" @click="emit('select', product)">
        <VImage :src="product.image" :alt="product.name" fit="cover" width="100%" height="156px" />
        <view class="grid gap-2 p-3">
          <text class="w-fit rounded-md bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
            {{ product.primaryTag }}
          </text>
          <text class="line-clamp-2 min-h-10 text-sm font-bold leading-5">
            {{ product.name }}
          </text>
          <view class="flex items-end justify-between gap-2">
            <text class="text-lg font-black text-[#f04438]">
              ¥{{ product.priceLabel }}
            </text>
            <VButton size="sm" shape="round" tone="danger" class-name="!h-8 !min-h-8 !w-8 !p-0" @click="emit('add', product)">
              +
            </VButton>
          </view>
        </view>
      </VCard>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
