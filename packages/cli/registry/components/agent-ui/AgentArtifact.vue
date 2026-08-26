<script setup lang="ts">
export interface AgentArtifactItem {
  content?: string
  id: string
  kind?: 'code' | 'document' | 'file' | 'image'
  language?: string
  previewUrl?: string
  title: string
  url?: string
}

defineProps<{
  artifact: AgentArtifactItem
}>()

const emit = defineEmits<{
  open: [artifact: AgentArtifactItem]
}>()
</script>

<template>
  <view class="agent-artifact overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <view class="flex min-h-11 items-center justify-between border-b border-slate-100 px-3.5">
      <view class="grid min-w-0">
        <text class="truncate text-xs font-bold text-slate-800">{{ artifact.title }}</text>
        <text class="text-[9px] uppercase tracking-wider text-slate-400">{{ artifact.kind || 'document' }}</text>
      </view>
      <button class="min-h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600" type="button" @click="emit('open', artifact)">打开</button>
    </view>
    <scroll-view v-if="artifact.content" class="max-h-72 bg-slate-950" scroll-x scroll-y>
      <text class="block whitespace-pre p-3.5 font-mono text-[11px] leading-5 text-slate-200">{{ artifact.content }}</text>
    </scroll-view>
    <image v-if="artifact.previewUrl" class="block h-60 w-full" :src="artifact.previewUrl" :alt="artifact.title" mode="aspectFit" />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
