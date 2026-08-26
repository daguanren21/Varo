<script setup lang="ts">
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
    attachments: () => []
  }
)

const emit = defineEmits<{
  remove: [attachment: AgentAttachmentItem]
}>()
</script>

<template>
  <view class="agent-attachments flex flex-wrap gap-2">
    <view v-for="attachment in attachments" :key="attachment.id" class="inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5">
      <image v-if="attachment.previewUrl" class="h-7 w-7 rounded-lg bg-white" :src="attachment.previewUrl" mode="aspectFill" />
      <text v-else class="grid h-7 w-7 place-items-center rounded-lg bg-white text-[9px] font-bold text-slate-500">FILE</text>
      <view class="grid min-w-0">
        <text class="max-w-40 truncate text-[11px] font-semibold text-slate-700">{{ attachment.name }}</text>
        <text v-if="attachment.size" class="text-[9px] text-slate-400">{{ attachment.size }}</text>
      </view>
      <button class="grid h-7 w-7 place-items-center rounded-full bg-transparent text-slate-400" type="button" :aria-label="`移除 ${attachment.name}`" @click="emit('remove', attachment)">×</button>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
