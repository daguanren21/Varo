<script setup lang="ts">
import { shallowRef } from 'wevu'
import VTag from '../../components/ui/tag.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VInput from '../../components/ui/v-input.vue'
import { navigateRetail } from '../../features/retail/navigation'

const keyword = shallowRef('')
const history = ['连衣裙', '蓝牙耳机', '餐具', '午休毯']
const trending = [
  { label: '夏季上新', rank: 1, tone: 'danger' as const },
  { label: '会员满减', rank: 2, tone: 'danger' as const },
  { label: '数码好物', rank: 3, tone: 'default' as const },
  { label: '家居焕新', rank: 4, tone: 'default' as const },
]

function search(value = keyword.value) {
  const query = value.trim()
  if (!query) { return }
  navigateRetail('/retail-goods/result/index', { keyword: query })
}
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f8] text-slate-950">
    <view class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 bg-white px-3 py-3">
      <VInput :value="keyword" placeholder="搜索商品" clearable @update:value="keyword = $event" />
      <VButton size="sm" @click="search()">
        搜索
      </VButton>
    </view>

    <view class="grid gap-3 px-3 py-3">
      <VCard class-name="grid gap-3" variant="default">
        <text class="text-sm font-black">
          最近搜索
        </text>
        <view class="flex flex-wrap gap-2">
          <VButton
            v-for="item in history"
            :key="item"
            size="sm"
            variant="ghost"
            tone="default"
            class-name="!rounded-full !bg-slate-100 !px-3 !text-[10px] !text-slate-600"
            @click="search(item)"
          >
            {{ item }}
          </VButton>
        </view>
      </VCard>
      <VCard class-name="grid gap-3" variant="default">
        <text class="text-sm font-black">
          热门发现
        </text>
        <view class="grid grid-cols-2 gap-2">
          <VButton
            v-for="item in trending"
            :key="item.label"
            size="sm"
            variant="outline"
            tone="default"
            class-name="!flex !min-h-11 !w-full !items-center !justify-start !gap-2 !rounded-xl !border-slate-100 !bg-white !px-3 !text-left"
            @click="search(item.label)"
          >
            <VTag :tone="item.tone" variant="soft" size="sm">
              {{ item.rank }}
            </VTag>
            <text class="text-xs font-semibold">
              {{ item.label }}
            </text>
          </VButton>
        </view>
      </VCard>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "商品搜索",
  "usingComponents": {}
}
</json>
