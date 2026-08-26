<script setup lang="ts">
import { computed, shallowRef } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import type { AgentAdvancedStatus } from './advanced-types'
import { agentChevronDownIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    defaultOpen?: boolean
    duration?: string
    name: string
    output?: string
    status?: AgentAdvancedStatus
    summary?: string
  }>(),
  {
    defaultOpen: false,
    output: '',
    status: 'completed'
  }
)

const emit = defineEmits<{
  retry: []
  'update:open': [value: boolean]
}>()

const open = shallowRef(props.defaultOpen || props.status === 'running' || props.status === 'failed')
const rootClass = computed(() =>
  cn('agent-tool-result overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', props.className)
)

function toggle() {
  open.value = !open.value
  emit('update:open', open.value)
}

function dotClass() {
  return cn(
    'h-2 w-2 flex-none rounded-full',
    props.status === 'completed' && 'bg-green-600',
    props.status === 'running' && 'agent-tool-result__running bg-teal-700 shadow-[0_0_0_3px_#ccfbf1]',
    props.status === 'failed' && 'bg-red-600',
    props.status === 'waiting' && 'bg-slate-300'
  )
}
</script>

<template>
  <view :class="rootClass" :data-status="status">
    <button class="flex min-h-12 w-full items-center justify-between gap-3 border-0 bg-white px-[13px] text-left" type="button" :aria-expanded="open" @click="toggle">
      <view class="flex min-w-0 items-center gap-2.5">
        <text :class="dotClass()" aria-hidden="true" />
        <text class="truncate text-xs font-bold text-slate-800">{{ name }}</text>
      </view>
      <view class="flex flex-none items-center gap-2">
        <text class="text-[10px] text-slate-400">{{ duration || summary }}</text>
        <image :class="['h-4 w-4 transition-transform', open && 'rotate-180']" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
      </view>
    </button>

    <view v-if="open" class="border-t border-slate-800 bg-slate-950 p-3 text-slate-300">
      <slot>
        <text class="block whitespace-pre-wrap font-mono text-[10px] leading-[17px]">{{ output }}</text>
      </slot>
    </view>

    <button v-if="status === 'failed' && open" class="m-3 min-h-8 rounded-lg border border-red-200 bg-white px-2.5 text-[10px] font-bold text-red-600" type="button" @click="emit('retry')">
      Retry
    </button>
  </view>
</template>

<style scoped>
.agent-tool-result button::after { border: 0; }
.agent-tool-result__running { animation: agent-tool-result-pulse 1s ease-in-out infinite; }
@keyframes agent-tool-result-pulse { 50% { opacity: .35; transform: scale(.72); } }
@media (prefers-reduced-motion: reduce) { .agent-tool-result__running { animation: none; } }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
