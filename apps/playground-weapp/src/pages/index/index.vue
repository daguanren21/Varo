<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VInput, VSwitch } from '@varo/ui-weapp'

const name = ref('Varo')
const loading = ref(false)
const enabled = ref(true)
const clicks = ref(0)

function onPrimaryClick() {
  clicks.value += 1
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 900)
}
</script>

<template>
  <view class="page">
    <view class="hero">
      <text class="kicker">@varo/playground-weapp</text>
      <text class="title">Weapp Playground</text>
      <text class="desc">真实 weapp-vite 运行时，用于验证 `@varo/ui-weapp` 组件与主题契约。</text>
    </view>

    <view class="card">
      <text class="card-title">Button / Switch</text>
      <view class="row">
        <VButton :loading="loading" tone="primary" @click="onPrimaryClick">主操作 {{ clicks }}</VButton>
        <VButton variant="outline">次要操作</VButton>
        <VButton variant="ghost" :disabled="!enabled">Ghost</VButton>
      </view>
      <view class="switch-row">
        <text>启用 Ghost 按钮</text>
        <VSwitch v-model="enabled" />
      </view>
    </view>

    <view class="card">
      <text class="card-title">Input</text>
      <VInput v-model:value="name" clearable placeholder="输入名称" />
      <text class="meta">当前值：{{ name || '空' }}</text>
    </view>
  </view>
</template>

<style scoped>
.page {
  display: grid;
  gap: 16px;
  padding: 24px 16px 40px;
}

.hero {
  display: grid;
  gap: 8px;
}

.kicker {
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
}

.title {
  font-size: 28px;
  font-weight: 800;
}

.desc {
  color: #5b677a;
  font-size: 13px;
  line-height: 1.6;
}

.card {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(23, 32, 51, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
}

.card-title {
  font-size: 15px;
  font-weight: 700;
}

.row,
.switch-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.switch-row {
  justify-content: space-between;
  color: #5b677a;
  font-size: 13px;
}

.meta {
  color: #5b677a;
  font-size: 12px;
}
</style>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Playground",
  "usingComponents": {}
}
</json>
