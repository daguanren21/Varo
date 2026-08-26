<script setup lang="ts">
import VBadge from '../ui/badge.vue'
import VButton from '../ui/v-button.vue'
import type { MallProduct } from '../../features/mall/useMallAgent'

withDefaults(
  defineProps<{
    products?: MallProduct[]
  }>(),
  {
    products: () => []
  }
)

const emit = defineEmits<{
  buy: [product: MallProduct]
  select: [product: MallProduct]
}>()
</script>

<template>
  <view class="grid grid-cols-2 gap-2.5">
    <view
      v-for="product in products"
      :key="product.id"
      class="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_4px_16px_rgba(15,23,42,.06)]"
    >
      <button class="m-0 block w-full bg-transparent p-0 text-left" type="button" @click="emit('select', product)">
        <view class="relative grid aspect-[4/3] place-items-center overflow-hidden" :style="{ background: product.accent }">
          <view class="absolute -right-6 -top-8 h-24 w-24 rounded-full border-[18px] border-white/10" />
          <VBadge class="absolute left-2 top-2" tone="danger" variant="solid">{{ product.category }}</VBadge>

          <view v-if="product.id === 'headphones'" class="relative flex items-center gap-5" aria-label="降噪耳机示意图">
            <view class="h-16 w-7 rotate-[-8deg] rounded-full bg-white shadow-[0_8px_18px_rgba(15,23,42,.3)]">
              <text class="mx-auto mt-3 block h-2 w-2 rounded-full bg-slate-800" />
            </view>
            <view class="h-16 w-7 rotate-[8deg] rounded-full bg-white shadow-[0_8px_18px_rgba(15,23,42,.3)]">
              <text class="mx-auto mt-3 block h-2 w-2 rounded-full bg-slate-800" />
            </view>
            <text class="absolute left-1/2 top-[-10px] h-10 w-20 -translate-x-1/2 rounded-t-full border-[5px] border-b-0 border-white/70" />
          </view>

          <view v-else-if="product.id === 'milk'" class="relative h-[92px] w-[66px] rounded-b-lg bg-white shadow-[0_10px_22px_rgba(30,64,175,.22)]" aria-label="牛奶包装示意图">
            <view class="absolute -top-5 left-0 h-6 w-full bg-white [clip-path:polygon(18%_100%,38%_0,80%_0,100%_100%)]" />
            <text class="mx-auto mt-7 block w-fit rounded-full bg-blue-600 px-2 py-1 text-[10px] font-black text-white">MILK</text>
            <text class="mt-2 block text-center text-[9px] font-bold text-blue-700">鲜京采</text>
          </view>

          <view v-else-if="product.id === 'rice-cooker'" class="relative mt-3 h-[68px] w-[92px] rounded-[28px_28px_18px_18px] bg-white shadow-[0_10px_22px_rgba(127,29,29,.2)]" aria-label="电饭煲示意图">
            <text class="absolute -top-3 left-2 h-5 w-[76px] rounded-full bg-slate-100 shadow-sm" />
            <text class="absolute left-1/2 top-6 h-3 w-8 -translate-x-1/2 rounded bg-slate-800" />
            <text class="absolute bottom-[-5px] left-3 h-2 w-3 rounded-b bg-slate-700" />
            <text class="absolute bottom-[-5px] right-3 h-2 w-3 rounded-b bg-slate-700" />
          </view>

          <view v-else class="relative h-[58px] w-[112px] rotate-[-8deg] rounded-[40px_16px_20px_24px] bg-white shadow-[0_12px_20px_rgba(20,83,45,.2)]" aria-label="跑步鞋示意图">
            <text class="absolute bottom-1 left-4 h-1.5 w-20 rounded-full bg-emerald-600" />
            <text class="absolute right-2 top-3 h-3 w-8 rotate-[-18deg] rounded-full border-t-2 border-emerald-500" />
          </view>
        </view>

        <view class="grid gap-1.5 p-2.5 pb-2">
          <text class="line-clamp-2 min-h-10 text-[13px] font-bold leading-5 text-slate-900">{{ product.name }}</text>
          <text class="line-clamp-1 text-[10px] text-slate-400">{{ product.subtitle }}</text>
          <view class="flex items-end justify-between gap-1">
            <text class="text-base font-black text-[#e1251b]">¥{{ (product.price / 100).toFixed(2) }}</text>
            <text class="text-[9px] text-slate-400">{{ product.rating }}</text>
          </view>
        </view>
      </button>
      <view class="px-2.5 pb-2.5">
        <VButton block size="sm" :disabled="product.stock === 0" @click="emit('buy', product)">
          {{ product.stock === 0 ? '已售罄' : '让 AI 帮我买' }}
        </VButton>
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
