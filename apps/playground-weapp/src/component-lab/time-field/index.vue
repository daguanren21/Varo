<script setup lang="ts">
import VButton from '../../components/ui/v-button.vue'
import TimeFieldDemo from '../demos/TimeFieldDemo.vue'

function backToComponents() {
  void wx.redirectTo({ url: '/component-lab/index/index' })
}
</script>

<template>
  <view class="min-h-screen bg-[var(--varo-ui-bg)] text-[var(--varo-ui-text)]">
    <view class="px-4 pt-2">
      <VButton variant="text" size="sm" @click="backToComponents">
        返回组件目录
      </VButton>
    </view>
    <TimeFieldDemo />
  </view>
</template>
