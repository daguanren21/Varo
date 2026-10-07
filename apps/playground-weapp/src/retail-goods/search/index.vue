<script setup lang="ts">
import { shallowRef } from 'wevu'
import VButton from '../../components/ui/v-button.vue'
import VInput from '../../components/ui/v-input.vue'
import { navigateRetail } from '../../features/retail/navigation'

const keyword = shallowRef('')
const suggestions = ['连衣裙', '蓝牙耳机', '餐具', '午休毯']

function search(value = keyword.value) {
  const query = value.trim()
  if (!query) { return }
  navigateRetail('/retail-goods/result/index', { keyword: query })
}
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] pb-32 text-[#292722]">
    <view class="mx-auto grid box-border w-full max-w-[1160px] gap-7 px-[18px] py-6 md:px-9">
      <view class="grid gap-5">
        <text class="retail-heading text-[26px] leading-9">
          搜索商品
        </text>
        <view class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <VInput
            :value="keyword"
            aria-label="搜索商品"
            placeholder="输入商品名称或关键词"
            confirm-type="search"
            clearable
            class-name="!min-h-12 !rounded-[3px]"
            @update:value="keyword = $event"
            @confirm="search()"
          />
          <VButton class-name="!min-h-12 !rounded-[3px] !px-4 !text-base" @click="search()">
            搜索
          </VButton>
        </view>
      </view>

      <view class="grid gap-4 border-t border-[#dcd6cb] pt-6">
        <text class="retail-heading text-xl leading-7">
          搜索建议
        </text>
        <view class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <VButton
            v-for="item in suggestions"
            :key="item"
            variant="outline"
            tone="default"
            class-name="!min-h-12 !w-full !rounded-[3px] !border-[#dcd6cb] !bg-transparent !px-3 !text-[15px] !font-normal !text-[#292722]"
            @click="search(item)"
          >
            {{ item }}
          </VButton>
        </view>
      </view>
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
