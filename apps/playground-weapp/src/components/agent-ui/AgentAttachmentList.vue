<script setup lang="ts">
import type { AgentAttachmentItem } from './advanced-types'
import { computed } from 'wevu'
import VFileType from '../ui/v-file-type.vue'

const props = withDefaults(
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

const items = computed(() => props.attachments.map(attachment => ({
  attachment,
  metadata: [attachment.size, attachment.mimeType].filter(Boolean).join(' · '),
  removeLabel: `移除 ${attachment.name}`,
})))
</script>

<template>
  <view class="agent-attachments grid gap-2.5 rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] p-3 shadow-sm">
    <view class="flex items-end justify-between gap-3 px-0.5">
      <view class="grid gap-0.5">
        <text class="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--varo-agent-primary)]">
          Files
        </text>
        <text class="text-xs font-bold text-[var(--varo-agent-foreground)]">
          附件
        </text>
      </view>
      <text class="text-[10px] font-bold text-[var(--varo-agent-muted)]">
        {{ attachments.length }} items
      </text>
    </view>
    <view class="grid gap-2">
      <view v-for="item in items" :key="item.attachment.id" class="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-3 shadow-sm">
        <image v-if="item.attachment.previewUrl" class="h-9 w-9 flex-none rounded-xl" :src="item.attachment.previewUrl" mode="aspectFill" aria-hidden="true" />
        <VFileType v-else :filename="item.attachment.name" :mime-type="item.attachment.mimeType" decorative />
        <view class="grid min-w-0 flex-1 gap-0.5">
          <text class="break-all text-[12px] font-bold text-[var(--varo-agent-foreground)]">
            {{ item.attachment.name }}
          </text>
          <text class="break-all text-[10px] text-[var(--varo-agent-muted)]">
            {{ item.metadata }}
          </text>
        </view>
        <button class="agent-native-button agent-attachments__remove agent-action--danger flex min-h-8 flex-none items-center justify-center rounded-lg border-0 bg-transparent px-2 text-[10px] font-bold text-[var(--varo-agent-muted)]" :aria-label="item.removeLabel" @click="emit('remove', item.attachment)">
          移除
        </button>
      </view>
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
