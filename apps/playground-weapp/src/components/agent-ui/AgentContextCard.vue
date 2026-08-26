<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import type { AgentContextChunk } from './advanced-types'

const props = withDefaults(
  defineProps<{
    chunks?: AgentContextChunk[]
    className?: ClassValue
    title?: string
  }>(),
  {
    chunks: () => [],
    title: 'Retrieved context'
  }
)

const emit = defineEmits<{
  open: [chunk: AgentContextChunk]
}>()

const rootClass = computed(() =>
  cn('agent-context-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', props.className)
)
</script>

<template>
  <view :class="rootClass">
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-[13px]">
      <text class="text-xs font-bold text-slate-800">{{ title }}</text>
      <text class="text-[10px] tabular-nums text-slate-400">{{ chunks.length }} chunks</text>
    </view>

    <view class="grid gap-2 p-2.5">
      <view v-for="chunk in chunks" :key="chunk.id" class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <view class="flex min-h-9 items-center justify-between gap-2 border-b border-slate-100 px-3">
          <text class="truncate text-[11px] font-bold text-slate-700">{{ chunk.label || chunk.source || 'Context' }}</text>
          <text v-if="chunk.content.length" class="flex-none text-[9px] tabular-nums text-slate-400">{{ chunk.content.length }} chars</text>
        </view>
        <text class="block px-3 py-2.5 text-[11px] leading-[18px] text-slate-500">{{ chunk.content }}</text>
        <view class="flex min-h-9 items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-3">
          <text class="text-[8px] font-bold uppercase tracking-[.08em] text-slate-400">{{ chunk.sourceType || 'Source' }}</text>
          <button class="max-w-[65%] truncate border-0 bg-transparent p-0 text-[10px] font-semibold text-teal-700" type="button" @click="emit('open', chunk)">{{ chunk.source || 'Open' }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.agent-context-card button::after { border: 0; }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
