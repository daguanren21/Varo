<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import type { AgentAdvancedStatus, AgentFlowNode } from './advanced-types'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    nodes?: AgentFlowNode[]
    title?: string
  }>(),
  {
    nodes: () => [],
    title: 'Agent workflow'
  }
)

const emit = defineEmits<{
  add: [afterId?: string]
  select: [node: AgentFlowNode]
}>()

const rootClass = computed(() =>
  cn('agent-flowchart overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', props.className)
)

function nodeClass(type: AgentFlowNode['type']) {
  return cn(
    'agent-flowchart__node grid min-h-[72px] w-full gap-1 rounded-[14px] border bg-white p-3 text-left shadow-sm',
    type === 'trigger' && 'border-teal-200',
    type === 'condition' && 'border-amber-200',
    type === 'action' && 'border-blue-200',
    type === 'result' && 'border-green-200'
  )
}

function statusClass(status?: AgentAdvancedStatus) {
  return cn(
    'h-2 w-2 rounded-full',
    status === 'completed' && 'bg-green-600',
    status === 'running' && 'bg-teal-700',
    status === 'failed' && 'bg-red-600',
    (!status || status === 'waiting') && 'bg-slate-300'
  )
}
</script>

<template>
  <view :class="rootClass">
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 px-[13px]">
      <text class="text-xs font-bold text-slate-800">{{ title }}</text>
      <button class="min-h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-bold text-slate-600" type="button" @click="emit('add', undefined)">+ Step</button>
    </view>

    <view class="grid p-3">
      <template v-for="(node, index) in nodes" :key="node.id">
        <button :class="nodeClass(node.type)" type="button" :data-type="node.type" @click="emit('select', node)">
          <view class="flex items-center justify-between gap-2">
            <text class="text-[8px] font-bold uppercase tracking-[.1em] text-slate-400">{{ node.type }}</text>
            <text :class="statusClass(node.status)" aria-hidden="true" />
          </view>
          <text class="text-[12px] font-bold text-slate-800">{{ node.label }}</text>
          <text v-if="node.detail" class="text-[10px] leading-4 text-slate-400">{{ node.detail }}</text>
        </button>
        <button v-if="index < nodes.length - 1" class="agent-flowchart__connector mx-auto grid h-9 w-7 place-items-center border-0 bg-transparent text-[11px] font-black text-teal-700" type="button" :aria-label="`Add after ${node.label}`" @click="emit('add', node.id)">+</button>
      </template>
    </view>
  </view>
</template>

<style scoped>
.agent-flowchart button::after { border: 0; }
.agent-flowchart__connector { background: linear-gradient(#cbd5e1, #cbd5e1) center / 1px 100% no-repeat; }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
