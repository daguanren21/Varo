<script setup lang="ts">
import { agentCloseIcon } from './agent-icons'

export interface AgentAttachmentItem {
  id: string
  mimeType?: string
  name: string
  previewUrl?: string
  size?: string
}

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
  <view class="agent-attachments flex flex-wrap gap-2">
    <view v-for="attachment in attachments" :key="attachment.id" class="inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] px-2.5">
      <image v-if="attachment.previewUrl" class="h-7 w-7 rounded-lg bg-[var(--varo-agent-surface)]" :src="attachment.previewUrl" mode="aspectFill" />
      <text v-else class="grid h-7 w-7 place-items-center rounded-lg bg-[var(--varo-agent-surface)] text-[10px] font-bold text-[var(--varo-agent-text)]">
        FILE
      </text>
      <view class="grid min-w-0">
        <text class="max-w-40 truncate text-[12px] font-semibold text-[var(--varo-agent-foreground)]">
          {{ attachment.name }}
        </text>
        <text v-if="attachment.size" class="text-[10px] text-[var(--varo-agent-muted)]">
          {{ attachment.size }}
        </text>
      </view>
      <button class="grid h-7 w-7 place-items-center rounded-full bg-transparent" type="button" :aria-label="`移除 ${attachment.name}`" @click="emit('remove', attachment)">
        <image class="h-4 w-4" :src="agentCloseIcon" mode="aspectFit" aria-hidden="true" />
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
