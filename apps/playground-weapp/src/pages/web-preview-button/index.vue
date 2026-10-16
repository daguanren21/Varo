<script setup lang="ts">
import { computed, shallowRef } from 'wevu'
import VButton from '../../components/ui/v-button.vue'

const clickCount = shallowRef(0)
const disabled = shallowRef(false)
const loading = shallowRef(false)

const buttonStateLabel = computed(() => loading.value ? '加载中' : disabled.value ? '已禁用' : '可点击')
const toggleDisabledLabel = computed(() => disabled.value ? '启用按钮' : '禁用按钮')
const toggleLoadingLabel = computed(() => loading.value ? '结束加载' : '开始加载')
const buttonDiagnostic = computed(() => `disabled=${disabled.value};loading=${loading.value};clicks=${clickCount.value}`)

function recordClick() {
  clickCount.value += 1
}

function toggleDisabled() {
  disabled.value = !disabled.value
}

function toggleLoading() {
  loading.value = !loading.value
}

function resetDemo() {
  clickCount.value = 0
  disabled.value = false
  loading.value = false
}
</script>

<template>
  <view class="box-border min-h-screen bg-[var(--varo-ui-surface)] p-4 text-[var(--varo-ui-text)]">
    <view class="mb-5 grid gap-1">
      <text class="text-lg font-bold">
        Button 按钮
      </text>
      <text class="text-sm text-[var(--varo-ui-text-muted)]">
        点击按钮，体验不同样式与交互状态。
      </text>
    </view>

    <view class="mb-5 grid gap-3">
      <view class="flex flex-wrap items-center justify-between gap-2" data-preview-field="button-state" :data-preview-value="buttonDiagnostic">
        <text class="text-sm font-semibold" data-preview-field="button-click-count">
          点击次数：{{ clickCount }}
        </text>
        <text class="text-xs text-[var(--varo-ui-text-muted)]" data-preview-field="button-state-label">
          按钮状态：{{ buttonStateLabel }}
        </text>
      </view>
      <VButton
        block
        aria-label="点击加一"
        class-name="preview-button-increment"
        :disabled="disabled"
        :loading="loading"
        loading-text="加载中…"
        @click="recordClick"
      >
        点击 +1
      </VButton>
      <view class="grid grid-cols-2 gap-2">
        <VButton block :aria-label="toggleDisabledLabel" class-name="preview-button-toggle-disabled" variant="outline" @click="toggleDisabled">
          {{ toggleDisabledLabel }}
        </VButton>
        <VButton block :aria-label="toggleLoadingLabel" class-name="preview-button-toggle-loading" variant="outline" @click="toggleLoading">
          {{ toggleLoadingLabel }}
        </VButton>
      </view>
      <VButton aria-label="重置示例" class-name="preview-button-reset" size="sm" variant="text" @click="resetDemo">
        重置示例
      </VButton>
    </view>

    <view class="mb-5 grid gap-3">
      <text class="text-sm font-semibold">
        常用样式
      </text>
      <view class="grid grid-cols-2 gap-2">
        <VButton block @click="recordClick">
          实心按钮
        </VButton>
        <VButton block variant="outline" @click="recordClick">
          描边按钮
        </VButton>
        <VButton block variant="ghost" @click="recordClick">
          幽灵按钮
        </VButton>
        <VButton block variant="text" @click="recordClick">
          文字按钮
        </VButton>
      </view>
    </view>

    <view class="grid gap-3">
      <text class="text-sm font-semibold">
        按钮尺寸
      </text>
      <view class="flex flex-wrap items-center gap-2">
        <VButton size="sm" @click="recordClick">
          小号
        </VButton>
        <VButton size="md" @click="recordClick">
          中号
        </VButton>
        <VButton size="lg" @click="recordClick">
          大号
        </VButton>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Button 按钮",
  "usingComponents": {}
}
</json>
