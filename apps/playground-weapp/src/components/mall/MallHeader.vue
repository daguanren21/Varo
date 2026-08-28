<script setup lang="ts">
import { shallowRef } from 'wevu'
import { useWeappChrome } from '../../composables/useWeappChrome'
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
    class="mall-header sticky top-0 z-30 grid gap-2.5 bg-[linear-gradient(135deg,#e1251b_0%,#f43f5e_100%)] px-3.5 pb-3 shadow-[0_4px_18px_rgba(153,27,27,.18)]"
    :style="rootStyle"
  >
    <view class="flex items-center justify-between gap-3" :style="navigationStyle">
      <button
        class="m-0 flex min-h-9 min-w-0 flex-1 items-center justify-start gap-1.5 bg-transparent p-0 text-xs font-bold text-white"
        type="button"
        @click="emit('address')"
      >
        <VIcon name="location" size="16" />
        <text class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {{ address }}
        </text>
        <text aria-hidden="true">
          ›
        </text>
      </button>
      <button
        class="relative m-0 flex min-h-9 flex-none items-center gap-1.5 bg-transparent p-0 text-xs font-bold text-white"
        type="button"
        @click="emit('history')"
      >
        <text>订单</text>
        <text v-if="cartCount" class="grid h-4 min-w-4 place-items-center rounded-full bg-white text-[9px] text-[#e1251b]">
          {{ cartCount }}
        </text>
      </button>
    </view>

    <view class="flex min-h-11 w-full items-center gap-2 rounded-full border-2 border-white/50 bg-white py-0 pl-3 pr-1">
      <VIcon name="search" size="17" tone="muted" />
      <input
        v-model="keyword"
        class="min-w-0 flex-1 text-[13px] text-slate-950"
        placeholder="搜索京东好物，或让 AI 帮你买"
        confirm-type="search"
        @confirm="search"
      >
      <button
        class="m-0 inline-flex min-h-[34px] min-w-[58px] items-center justify-center rounded-full border-0 bg-[#e1251b] px-3 text-xs font-bold text-white"
        type="button"
        @click="search"
      >
        搜索
      </button>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
