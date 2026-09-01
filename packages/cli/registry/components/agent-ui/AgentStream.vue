<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import AgentMarkdown from './AgentMarkdown.vue'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    content?: string
    cursor?: boolean
    final?: boolean
    error?: string
    status?: 'idle' | 'streaming' | 'completed' | 'failed'
  }>(),
  {
    content: '',
    cursor: true,
    final: false,
    error: '',
    status: 'idle',
  },
)

const emit = defineEmits<{
  retry: []
}>()
const rootClass = computed(() =>
  cn('agent-stream text-sm leading-7 text-[var(--varo-agent-foreground)]', props.className),
)
const normalizedContent = computed(() => String(props.content ?? ''))
</script>

<template>
  <view :class="rootClass" :data-status="status" aria-live="polite">
    <text v-if="status === 'streaming' && !final" class="block whitespace-pre-wrap break-words">
      {{ normalizedContent }}
    </text>
    <AgentMarkdown v-else :content="normalizedContent" :final="final || status === 'completed'" />
    <text
      v-if="cursor && status === 'streaming'"
      class="agent-stream__cursor ml-[3px] inline-block h-[1.15em] w-0.5 rounded-full bg-[var(--varo-agent-primary)] align-[-.18em]"
      aria-hidden="true"
    />
    <view v-if="status === 'failed'" class="mt-2.5 flex min-h-11 items-center justify-between gap-3 rounded-[10px] bg-[var(--varo-agent-danger-soft)] px-3 py-2.5 text-xs text-[var(--varo-agent-danger)]" role="alert">
      <text>{{ error || '生成失败，请重试' }}</text>
      <button class="inline-flex min-h-9 min-w-[54px] items-center justify-center rounded-lg border border-[var(--varo-agent-danger)] bg-[var(--varo-agent-surface)] px-2.5 text-xs font-semibold text-[var(--varo-agent-danger)]" type="button" @click="emit('retry')">
        重试
      </button>
    </view>
  </view>
</template>

<style>
.agent-stream__cursor {
  animation: agent-cursor 0.72s steps(1) infinite;
}

@keyframes agent-cursor {
  0%,
  48% {
    opacity: 1;
  }

  49%,
  100% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-stream__cursor {
    animation: none;
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
