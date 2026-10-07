<script setup lang="ts">
import type { RetailProduct } from '../../lib/retail'
import { computed } from 'wevu'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VImage from '../../components/ui/v-image.vue'
import { formatRetailMoney, normalizeRetailProduct } from '../../lib/retail'

interface RetailCategory {
  id: string
  label: string
}

const props = withDefaults(
  defineProps<{
    activeId?: string
    categories?: RetailCategory[]
    products?: RetailProduct[]
  }>(),
  {
    activeId: '',
    categories: () => [],
    products: () => [],
  },
)

const emit = defineEmits<{
  'add': [product: RetailProduct]
  'select': [product: RetailProduct]
  'update:activeId': [categoryId: string]
}>()

const safeActiveId = computed(() => props.activeId || '')
const categoryItems = computed(() => (Array.isArray(props.categories) ? props.categories : []).map((category) => {
  const id = String(category?.id ?? '')
  const label = String(category?.label ?? '')
  const active = safeActiveId.value === id
  return {
    id,
    label,
    ariaLabel: active ? `${label}，已选中` : label,
    className: [
      '!min-h-11 !max-w-full !rounded-lg !px-4 !py-2 !text-sm !shadow-none',
      active
        ? '!border-[var(--varo-ui-border-lighter)] !bg-[var(--varo-ui-surface-muted)] !font-semibold !text-[var(--varo-ui-text)]'
        : '!font-normal !text-[var(--varo-ui-text-regular)]',
    ],
  }
}))
const safeProducts = computed(() => (Array.isArray(props.products) ? props.products : []).map((product) => {
  const normalized = normalizeRetailProduct(product)
  return {
    ...normalized,
    priceLabel: formatRetailMoney(normalized.price),
    primaryTag: normalized.tags[0] ?? '',
    selectLabel: `查看${normalized.name}`,
    addLabel: `将${normalized.name}加入购物车`,
  }
}))
const activeProducts = computed(() => {
  const filtered = safeProducts.value.filter(product => !safeActiveId.value || product.category === safeActiveId.value)
  return filtered.length > 0 ? filtered : safeProducts.value
})
</script>

<template>
  <view class="grid grid-cols-1 gap-6 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]">
    <text class="text-xl font-semibold leading-7">
      商品分类
    </text>

    <view v-if="categoryItems.length" class="flex flex-wrap gap-2 border-b border-[var(--varo-ui-border-lighter)] pb-4">
      <VButton
        v-for="category in categoryItems"
        :key="category.id"
        variant="ghost"
        tone="default"
        :aria-label="category.ariaLabel"
        :class-name="category.className"
        @click="emit('update:activeId', category.id)"
      >
        <text class="min-w-0 break-words leading-6">
          {{ category.label }}
        </text>
      </VButton>
    </view>

    <view v-if="activeProducts.length" class="grid grid-cols-2 gap-4">
      <view v-for="product in activeProducts" :key="product.id" class="grid min-w-0 grid-cols-1 grid-rows-[1fr_auto] gap-2">
        <VCard
          :padding="false"
          :interactive="true"
          :aria-label="product.selectLabel"
          role="button"
          variant="outline"
          class-name="h-full overflow-hidden !rounded-xl !border-[var(--varo-ui-border-lighter)] !shadow-none"
          @click="emit('select', product)"
        >
          <VImage
            :src="product.image"
            :alt="product.name"
            fit="cover"
            width="100%"
            height="160px"
            loading-text="图片加载中"
            error-text="图片暂不可用"
          />
          <view class="grid grid-cols-1 gap-2 p-3">
            <text class="line-clamp-2 min-h-12 break-words text-sm font-medium leading-6">
              {{ product.name }}
            </text>
            <text class="break-all text-xl font-semibold leading-7 tabular-nums">
              ¥{{ product.priceLabel }}
            </text>
            <text v-if="product.primaryTag" class="break-words text-xs leading-5 text-[var(--varo-ui-text-muted)]">
              {{ product.primaryTag }}
            </text>
          </view>
        </VCard>
        <VButton
          block
          tone="default"
          variant="outline"
          :aria-label="product.addLabel"
          class-name="!min-h-11 !w-full !rounded-lg !border-[var(--varo-ui-border-lighter)] !px-2 !text-sm !shadow-none"
          @click="emit('add', product)"
        >
          加入购物车
        </VButton>
      </view>
    </view>
    <text v-else class="py-8 text-center text-sm leading-6 text-[var(--varo-ui-text-muted)]">
      暂无商品
    </text>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
