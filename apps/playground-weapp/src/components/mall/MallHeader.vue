<script setup lang="ts">
import { shallowRef } from 'wevu'
import { useWeappChrome } from '../../composables/useWeappChrome'
import VButton from '../ui/v-button.vue'
import VIcon from '../ui/v-icon.vue'

withDefaults(
  defineProps<{
    address?: string
    cartCount?: number
  }>(),
  {
    address: '请选择收货地址',
    cartCount: 0,
  },
)

const emit = defineEmits<{
  address: []
  history: []
  search: [keyword: string]
}>()

const keyword = shallowRef('')
const { navigationStyle, rootStyle } = useWeappChrome()

function search() {
  const value = keyword.value.trim()
  if (value) { emit('search', value) }
}
</script>

<template>
  <view
    class="mall-header sticky top-0 z-30 grid min-w-0 grid-cols-1 gap-2.5 bg-[linear-gradient(135deg,#e1251b_0%,#f43f5e_100%)] px-3.5 pb-3 shadow-[0_4px_18px_rgba(153,27,27,.18)]"
    :style="rootStyle"
  >
    <view class="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3" :style="navigationStyle">
      <VButton
        block
        class-name="!m-0 !flex !min-h-9 !min-w-0 !justify-start !gap-1.5 !p-0 !text-xs !font-bold"
        color="#fff"
        variant="text"
        @click="emit('address')"
      >
        <VIcon name="location" :size="16" color="#fff" />
        <text class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {{ address }}
        </text>
        <text aria-hidden="true">
          ›
        </text>
      </VButton>
      <VButton
        class-name="relative !m-0 !flex !min-h-9 !gap-1.5 !whitespace-nowrap !p-0 !text-xs !font-bold"
        color="#fff"
        variant="text"
        @click="emit('history')"
      >
        <text>订单</text>
        <text v-if="cartCount" class="grid h-4 min-w-4 place-items-center rounded-full bg-white text-[9px] text-[#e1251b]">
          {{ cartCount }}
        </text>
      </VButton>
    </view>

    <view class="box-border flex min-h-11 w-full min-w-0 items-center gap-2 rounded-full border-2 border-white/50 bg-white py-0 pl-3 pr-1">
      <VIcon name="search" :size="17" tone="muted" />
      <input
        v-model="keyword"
        class="min-w-0 flex-1 text-[13px] text-slate-950"
        placeholder="搜索京东好物，或让 AI 帮你买"
        confirm-type="search"
        @confirm="search"
      >
      <VButton
        class-name="!m-0 !min-h-[34px] !min-w-[58px] !shrink-0"
        color="#e1251b"
        shape="round"
        size="sm"
        @click="search"
      >
        <text class="text-xs font-bold">
          搜索
        </text>
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
