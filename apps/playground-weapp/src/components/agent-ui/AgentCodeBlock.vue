<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    code?: string
    filename?: string
    focusedLines?: number[]
    language?: string
    lineNumbers?: boolean
    status?: 'complete' | 'streaming'
  }>(),
  {
    code: '',
    filename: 'untitled.ts',
    focusedLines: () => [],
    language: 'text',
    lineNumbers: true,
    status: 'complete'
  }
)

const emit = defineEmits<{
  copy: [code: string]
}>()

const rootClass = computed(() =>
  cn('agent-code-block relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 shadow-sm', props.className)
)
const lines = computed(() => props.code.split('\n'))

function lineClass(line: number) {
  return cn(
    'flex min-w-max px-3 font-mono text-[11px] leading-[19px] text-slate-300',
    props.focusedLines.includes(line) && 'bg-teal-400/15 text-slate-50'
  )
}
</script>

<template>
  <view :class="rootClass" :data-status="status">
    <view class="flex min-h-[42px] items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-3">
      <view class="flex min-w-0 items-baseline gap-2">
        <text class="truncate text-xs font-bold text-slate-50">{{ filename }}</text>
        <text class="text-[9px] font-semibold uppercase tracking-[.08em] text-slate-500">{{ language }}</text>
      </view>
      <button class="min-h-8 rounded-lg border border-slate-700 bg-slate-900 px-2.5 text-[10px] font-semibold text-slate-400 active:bg-slate-800" type="button" @click="emit('copy', code)">
        Copy
      </button>
    </view>

    <scroll-view class="py-2.5" scroll-x :show-scrollbar="false">
      <view class="grid min-w-max">
        <view v-for="(line, index) in lines" :key="index" :class="lineClass(index + 1)">
          <text v-if="lineNumbers" class="w-7 flex-none select-none text-right tabular-nums text-slate-600" aria-hidden="true">{{ index + 1 }}</text>
          <text class="whitespace-pre px-2 font-normal">{{ line || ' ' }}</text>
        </view>
      </view>
    </scroll-view>

    <text v-if="status === 'streaming'" class="agent-code-block__cursor absolute right-3 bottom-3 h-3.5 w-1.5 bg-teal-400" aria-hidden="true" />
    <slot name="footer" />
  </view>
</template>

<style scoped>
.agent-code-block button::after { border: 0; }
.agent-code-block__cursor { animation: agent-code-cursor .75s steps(1) infinite; }
@keyframes agent-code-cursor { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .agent-code-block__cursor { animation: none; } }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
