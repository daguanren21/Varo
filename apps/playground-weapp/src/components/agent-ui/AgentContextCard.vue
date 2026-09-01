<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentContextChunk } from './advanced-types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(
  defineProps<{
    chunks?: AgentContextChunk[]
    className?: ClassValue
    title?: string
  }>(),
  {
    chunks: () => [],
    title: 'Retrieved context',
  },
)

const emit = defineEmits<{
  open: [chunk: AgentContextChunk]
}>()

const rootClass = computed(() =>
  cn('agent-context-card overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] shadow-sm', props.className),
)
</script>

<template>
  <view :class="rootClass">
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] px-[13px]">
      <text class="text-xs font-bold text-[var(--varo-agent-foreground)]">
        {{ title }}
      </text>
      <text class="text-[11px] tabular-nums text-[var(--varo-agent-muted)]">
        {{ chunks.length }} chunks
      </text>
    </view>

    <view class="grid gap-2 p-2.5">
      <view v-for="chunk in chunks" :key="chunk.id" class="overflow-hidden rounded-xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)]">
        <view class="flex min-h-9 items-center justify-between gap-2 border-b border-[var(--varo-agent-border)] px-3">
          <text class="truncate text-[12px] font-bold text-[var(--varo-agent-foreground)]">
            {{ chunk.label || chunk.source || 'Context' }}
          </text>
          <text v-if="chunk.content.length" class="flex-none text-[10px] tabular-nums text-[var(--varo-agent-muted)]">
            {{ chunk.content.length }} chars
          </text>
        </view>
        <text class="block px-3 py-2.5 text-[12px] leading-[18px] text-[var(--varo-agent-text)]">
          {{ chunk.content }}
        </text>
        <view class="flex min-h-9 items-center justify-between gap-2 border-t border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] px-3">
          <text class="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--varo-agent-muted)]">
            {{ chunk.sourceType || 'Source' }}
          </text>
          <button class="max-w-[65%] truncate border-0 bg-transparent p-0 text-[11px] font-semibold text-[var(--varo-agent-primary)]" type="button" @click="emit('open', chunk)">
            {{ chunk.source || 'Open' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.agent-context-card button::after {
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
