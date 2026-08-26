<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
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
    status: 'idle'
  }
)

const rootClass = computed(() =>
  cn('agent-stream text-sm leading-7 text-slate-800', props.className)
)
const normalizedContent = computed(() => String(props.content ?? ''))

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <view :class="rootClass" :data-status="status" aria-live="polite">
    <text v-if="status === 'streaming' && !final" class="block whitespace-pre-wrap break-words">{{ normalizedContent }}</text>
    <AgentMarkdown v-else :content="normalizedContent" :final="final || status === 'completed'" />
    <text
      v-if="cursor && status === 'streaming'"
      class="agent-stream__cursor ml-[3px] inline-block h-[1.15em] w-0.5 rounded-full bg-teal-700 align-[-.18em]"
      aria-hidden="true"
    />
    <view v-if="status === 'failed'" class="mt-2.5 flex min-h-11 items-center justify-between gap-3 rounded-[10px] bg-red-50 px-3 py-2.5 text-xs text-red-700" role="alert">
      <text>{{ error || '生成失败，请重试' }}</text>
      <button class="inline-flex min-h-[34px] min-w-[54px] items-center justify-center rounded-lg border border-red-200 bg-white px-2.5 text-xs font-semibold text-red-700" type="button" @click="emit('retry')">重试</button>
    </view>
  </view>
</template>

<style scoped>
.agent-stream__cursor { animation: agent-cursor .72s steps(1) infinite; }
@keyframes agent-cursor { 0%, 48% { opacity: 1; } 49%, 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .agent-stream__cursor { animation: none; } }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
