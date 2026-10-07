<script setup lang="ts">
import type { RetailProduct } from '../../features/retail/types'
import { computed, onLoad, onMounted, shallowRef } from 'wevu'
import { navigateRetail } from '../../features/retail/navigation'
import { useRetailStore } from '../../features/retail/store'
import { runRetailAction } from '../../features/retail/use-retail-page'
import VEmpty from '../ui/empty.vue'
import VButton from '../ui/v-button.vue'
import VInput from '../ui/v-input.vue'
import RetailProductCard from './RetailProductCard.vue'
import RetailRequestState from './RetailRequestState.vue'

withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
  }>(),
  {
    eyebrow: '',
    title: '商品列表',
  },
)

const category = shallowRef('')
const keyword = shallowRef('')
const sort = shallowRef<'default' | 'price' | 'sales'>('default')
const sortOptions = computed(() => [
  { label: '综合', value: 'default' as const, variant: sort.value === 'default' ? 'solid' as const : 'ghost' as const },
  { label: '销量', value: 'sales' as const, variant: sort.value === 'sales' ? 'solid' as const : 'ghost' as const },
  { label: '价格', value: 'price' as const, variant: sort.value === 'price' ? 'solid' as const : 'ghost' as const },
])
const { addToCart, products, loading, loadError, load } = useRetailStore()
const retryLoad = () => runRetailAction(load, () => loadError.value)
const visibleProducts = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  const filtered = products.value.filter((product) => {
    const categoryMatch = !category.value || product.category === category.value
    const keywordMatch = !query || `${product.name}${product.description}`.toLowerCase().includes(query)
    return categoryMatch && keywordMatch
  })
  if (sort.value === 'price') { return [...filtered].sort((left, right) => left.price - right.price) }
  if (sort.value === 'sales') { return [...filtered].sort((left, right) => right.sales - left.sales) }
  return filtered
})

onLoad((options) => {
  category.value = String(options?.category ?? '')
  keyword.value = String(options?.keyword ?? '')
})

onMounted(retryLoad)

function openProduct(product: RetailProduct) {
  navigateRetail('/retail-goods/details/index', { id: product.id })
}

function addProduct(product: RetailProduct) {
  return runRetailAction(() => {
    addToCart(product.id)
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  })
}
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] pb-32 text-[#292722]">
    <view class="sticky top-0 z-20 border-b border-[#dcd6cb] bg-[#f7f4ee]">
      <view class="mx-auto grid box-border w-full max-w-[1160px] gap-4 px-[18px] py-4 md:px-9">
        <view class="grid gap-1">
          <text v-if="eyebrow" class="text-[15px] leading-6 text-[#625e55]">
            {{ eyebrow }}
          </text>
          <text class="retail-heading text-[24px] leading-8">
            {{ title }}
          </text>
        </view>
        <VInput
          :value="keyword"
          aria-label="搜索当前商品"
          placeholder="搜索当前商品"
          clearable
          class-name="!min-h-11 !rounded-[3px]"
          @update:value="keyword = $event"
        />
        <view class="grid grid-cols-3 gap-2 md:max-w-md">
          <VButton
            v-for="option in sortOptions"
            :key="option.value"
            :variant="option.variant"
            class-name="!min-h-11 !w-full !rounded-[3px] !text-[15px]"
            @click="sort = option.value"
          >
            {{ option.label }}
          </VButton>
        </view>
      </view>
    </view>

    <view class="mx-auto box-border w-full max-w-[1160px] px-[18px] md:px-9">
      <RetailRequestState :loading="loading" :error="loadError" @retry="retryLoad" />
      <view v-if="!loading && !loadError && visibleProducts.length" class="grid grid-cols-2 gap-x-4 gap-y-7 py-6 md:grid-cols-4 md:gap-x-6 md:gap-y-9">
        <RetailProductCard
          v-for="product in visibleProducts"
          :key="product.id"
          :product="product"
          @select="openProduct"
          @add="addProduct"
        />
      </view>
      <view v-else-if="!loading && !loadError" class="grid min-h-[50vh] place-items-center py-8">
        <VEmpty title="没有找到商品" description="换个关键词或分类再试试" />
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
