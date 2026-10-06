<script setup lang="ts">
import type { DialogOpenChangeDetails } from '@varo-ui/headless'
import { computed, shallowRef } from 'wevu'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VDialogClose from '../../components/ui/v-dialog-close.vue'
import VDialogContent from '../../components/ui/v-dialog-content.vue'
import VDialogOverlay from '../../components/ui/v-dialog-overlay.vue'
import VDialogRoot from '../../components/ui/v-dialog-root.vue'
import VDialogTrigger from '../../components/ui/v-dialog-trigger.vue'

const dialogOpen = shallowRef(false)
const cancelDialogClose = shallowRef(true)
const dialogUpdateCount = shallowRef(0)
const dialogEvents = shallowRef('')
const dialogDiagnostic = computed(() => `open=${dialogOpen.value};cancel=${cancelDialogClose.value};updates=${dialogUpdateCount.value};events=${dialogEvents.value}`)

function prepareDialogOpen() {
  if (dialogOpen.value) { return }
  dialogEvents.value = ''
  dialogUpdateCount.value = 0
  cancelDialogClose.value = true
}
function recordDialogChange([open, details]: [boolean, DialogOpenChangeDetails]) {
  dialogEvents.value += `request:${open}|`
  if (!open && cancelDialogClose.value) { details.cancel() }
}
function updateDialogOpen(open: boolean) {
  dialogEvents.value += `update:${open}|`
  dialogUpdateCount.value += 1
  dialogOpen.value = open
}
function allowDialogClose() {
  cancelDialogClose.value = false
}
</script>

<template>
  <view class="box-border min-h-screen bg-[var(--varo-ui-bg)] px-3 py-4 text-[var(--varo-ui-text)]">
    <text class="mb-3 block text-sm text-[var(--varo-ui-text-muted)]">
      Dialog 诊断：受上游 weapp-vite #1172 的 plain-slot 上下文问题阻塞，尚未通过运行验证。
    </text>
    <VCard class-name="mb-3" variant="outline">
      <template #title>
        VDialog 同步取消与更新顺序
      </template>
      <template #description>
        Trigger 打开后首次关闭被取消；允许关闭后只增加一次 update:open。
      </template>
      <VDialogRoot
        class-name="preview-dialog"
        :open="dialogOpen"
        @open-change="recordDialogChange"
        @update:open="updateDialogOpen"
      >
        <VDialogTrigger @click="prepareDialogOpen">
          打开取消验证对话框
        </VDialogTrigger>
        <VDialogOverlay />
        <VDialogContent class-name="p-4">
          <view class="grid gap-3" data-preview-field="dialog-content">
            <text>先尝试关闭，对话框应保持打开，更新计数不变。</text>
            <text class="block break-all text-xs" data-preview-field="dialog-content-state" :data-preview-value="dialogDiagnostic">
              {{ dialogDiagnostic }}
            </text>
            <VButton class-name="preview-dialog-allow-close" @click="allowDialogClose">
              允许关闭对话框
            </VButton>
            <VDialogClose>尝试关闭对话框</VDialogClose>
          </view>
        </VDialogContent>
      </VDialogRoot>
      <text class="block break-all text-xs" data-preview-field="dialog-state" :data-preview-value="dialogDiagnostic">
        {{ dialogDiagnostic }}
      </text>
    </VCard>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Dialog 阻塞诊断",
  "usingComponents": {}
}
</json>
