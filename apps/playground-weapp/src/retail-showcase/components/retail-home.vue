<script setup lang="ts">
import type { RetailProduct } from '../../lib/retail'
import { computed, shallowRef } from 'wevu'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VImage from '../../components/ui/v-image.vue'
import VInput from '../../components/ui/v-input.vue'
import { formatRetailMoney, normalizeRetailProduct } from '../../lib/retail'

interface RetailCategory {
  id: string
  label: string
}

// WeChat validates initial child bindings before Wevu applies setup defaults.
defineOptions({
  properties: {
    banner: { type: null, value: '' },
    cartCount: { type: null, value: 0 },
  },
})

const props = withDefaults(
  defineProps<{
    banner?: string
    cartCount?: number
    categories?: RetailCategory[]
    products?: RetailProduct[]
    title?: string
  }>(),
  {
    banner: '',
    cartCount: 0,
    categories: () => [],
    products: () => [],
    title: 'Varo 零售生活馆',
  },
)

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
  label: String(category?.label ?? ''),
})))
const displayTitle = computed(() => props.title || 'Varo 零售生活馆')
const featured = computed(() => (Array.isArray(props.products) ? props.products : []).slice(0, 8).map((product) => {
  const normalized = normalizeRetailProduct(product)
  return {
    ...normalized,
    priceLabel: formatRetailMoney(normalized.price),
    primaryTag: normalized.tags[0] ?? '',
    selectLabel: `查看${normalized.name}`,
    addLabel: `将${normalized.name}加入购物车`,
  }
}))
const safeCartCount = computed(() => Number(props.cartCount) || 0)
const cartCountLabel = computed(() => safeCartCount.value > 99 ? '99+' : String(safeCartCount.value))

function search() {
  emit('search', keyword.value.trim())
}
</script>

<template>
  <view class="grid grid-cols-1 gap-6 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]">
    <view class="flex items-start justify-between gap-4">
      <text class="min-w-0 flex-1 break-words text-xl font-semibold leading-7">
        {{ displayTitle }}
      </text>
      <VButton
        tone="default"
        variant="outline"
        aria-label="打开购物车"
        class-name="!min-h-11 !shrink-0 !rounded-lg !border-[var(--varo-ui-border-lighter)] !px-3 !text-sm !shadow-none"
        @click="emit('cart')"
      >
        购物车
        <text v-if="safeCartCount" class="ml-2 text-xs tabular-nums">
          {{ cartCountLabel }}
        </text>
      </VButton>
    </view>

    <view class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
      <VInput
        :value="keyword"
        aria-label="搜索商品"
        placeholder="搜索商品、品牌或活动"
        clearable
        @update:value="keyword = $event"
      />
      <VButton
        tone="default"
        class-name="!min-h-11 !rounded-lg !bg-[var(--varo-ui-text)] !px-4 !text-sm !text-[var(--varo-ui-surface)] !shadow-none"
        @click="search"
      >
        搜索
      </VButton>
    </view>

    <view v-if="bannerSource" class="overflow-hidden rounded-xl">
      <VImage
        :src="bannerSource"
        :alt="displayTitle"
        fit="cover"
        width="100%"
        height="176px"
        loading-text="图片加载中"
        error-text="图片暂不可用"
      />
    </view>

    <view v-if="categoryItems.length" class="grid gap-3">
      <text class="text-sm font-semibold leading-6">
        商品分类
      </text>
      <view class="flex flex-wrap gap-2">
        <VButton
          v-for="category in categoryItems"
          :key="category.id"
          variant="ghost"
          tone="default"
          class-name="!min-h-11 !max-w-full !rounded-lg !bg-[var(--varo-ui-surface-muted)] !px-4 !py-2 !text-sm !font-medium !shadow-none"
          @click="emit('category', category)"
        >
          <text class="min-w-0 break-words leading-6">
            {{ category.label }}
          </text>
        </VButton>
      </view>
    </view>

    <view class="grid gap-4">
      <text class="text-sm font-semibold leading-6">
        商品
      </text>
      <view v-if="featured.length" class="grid grid-cols-2 gap-4">
        <view v-for="product in featured" :key="product.id" class="grid min-w-0 grid-cols-1 grid-rows-[1fr_auto] gap-2">
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
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
