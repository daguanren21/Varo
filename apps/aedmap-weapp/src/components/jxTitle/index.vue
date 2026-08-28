<script setup lang="ts">
import { onMounted, ref } from 'wevu'

defineProps<{
  title: string
}>()

const barHeight = ref(0)
const statusBarHeight = ref(0)
onMounted(() => {
  const windowInfo = wx.getWindowInfo()
  const menu = wx.getMenuButtonBoundingClientRect()
  barHeight.value = menu.top + menu.height
  statusBarHeight.value = windowInfo.statusBarHeight
})
</script>

<template>
  <view class="jx_title" :style="{ height: `${barHeight}px` }">
    <view
      class="jx-wrap"
      :style="{ marginTop: `${statusBarHeight}px` }"
      style="text-align: center"
    >
      <slot name="before" />
      <view class="title">
        <text> {{ title }}</text>
        <slot name="number" />
      </view>
      <slot name="after" />
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
