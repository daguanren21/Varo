<script setup lang="ts">
import type { AgentAttachmentItem } from './advanced-types'
import VFileType from '../ui/v-file-type.vue'
import { agentCloseIcon } from './agent-icons'

withDefaults(
  defineProps<{
    attachments?: AgentAttachmentItem[]
  }>(),
  {
    attachments: () => [],
  },
)

const emit = defineEmits<{
  remove: [attachment: AgentAttachmentItem]
}>()
</script>

<template>
  <view class="agent-attachments grid gap-2">
    <view v-for="attachment in attachments" :key="attachment.id" class="flex min-h-14 min-w-0 items-center gap-2 rounded-xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] px-2.5 py-2">
      <image v-if="attachment.previewUrl" class="h-9 w-9 flex-none rounded-lg bg-[var(--varo-agent-surface)]" :src="attachment.previewUrl" mode="aspectFill" aria-hidden="true" />
      <VFileType v-else :filename="attachment.name" :mime-type="attachment.mimeType" decorative />
      <view class="grid min-w-0 flex-1">
        <text class="break-all text-[12px] font-semibold text-[var(--varo-agent-foreground)]">
          {{ attachment.name }}
        </text>
        <text v-if="attachment.size" class="text-[10px] text-[var(--varo-agent-muted)]">
          {{ attachment.size }}
        </text>
      </view>
      <button class="agent-native-button agent-attachments__remove grid flex-none place-items-center rounded-full bg-transparent" :aria-label="`移除 ${attachment.name}`" @click="emit('remove', attachment)">
        <image class="h-4 w-4" :src="agentCloseIcon" mode="aspectFit" aria-hidden="true" />
      </button>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared",
  "usingComponents": {
    "v-file-type": "../ui/v-file-type"
  }
}
</json>
