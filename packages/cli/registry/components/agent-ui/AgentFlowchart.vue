<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentAdvancedStatus, AgentFlowNode } from './advanced-types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { agentPlusIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    nodes?: AgentFlowNode[]
    title?: string
  }>(),
  {
    nodes: () => [],
    title: 'Agent workflow',
  },
)

const emit = defineEmits<{
  add: [afterId?: string]
  select: [node: AgentFlowNode]
}>()

const rootClass = computed(() =>
  cn('agent-flowchart overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] shadow-sm', props.className),
)

function nodeClass(type: AgentFlowNode['type']) {
  return cn(
    'agent-flowchart__node grid min-h-[72px] w-full gap-1 rounded-[14px] border bg-[var(--varo-agent-surface)] p-3 text-left shadow-sm',
    type === 'trigger' && 'border-[var(--varo-agent-border-strong)]',
    type === 'condition' && 'border-[var(--varo-agent-warning)]',
    type === 'action' && 'border-[var(--varo-agent-primary)]',
    type === 'result' && 'border-[var(--varo-agent-success)]',
  )
}

function statusClass(status?: AgentAdvancedStatus) {
  return cn(
    'h-2 w-2 rounded-full',
    status === 'completed' && 'bg-[var(--varo-agent-success)]',
    status === 'running' && 'bg-[var(--varo-agent-primary)]',
    status === 'failed' && 'bg-[var(--varo-agent-danger)]',
    (!status || status === 'waiting') && 'bg-[var(--varo-agent-border-strong)]',
  )
}
</script>

<template>
  <view :class="rootClass">
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--varo-agent-border)] px-[13px]">
      <text class="text-xs font-bold text-[var(--varo-agent-foreground)]">
        {{ title }}
      </text>
      <button class="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-2.5 text-[11px] font-bold text-[var(--varo-agent-text)]" type="button" @click="emit('add', undefined)">
        <image class="h-3.5 w-3.5" :src="agentPlusIcon" mode="aspectFit" aria-hidden="true" />
        Step
      </button>
    </view>

    <view class="grid p-3">
      <template v-for="(node, index) in nodes" :key="node.id">
        <button :class="nodeClass(node.type)" type="button" :data-type="node.type" @click="emit('select', node)">
          <view class="flex items-center justify-between gap-2">
            <text class="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--varo-agent-muted)]">
              {{ node.type }}
            </text>
            <text :class="statusClass(node.status)" aria-hidden="true" />
          </view>
          <text class="text-[12px] font-bold text-[var(--varo-agent-foreground)]">
            {{ node.label }}
          </text>
          <text v-if="node.detail" class="text-[11px] leading-4 text-[var(--varo-agent-muted)]">
            {{ node.detail }}
          </text>
        </button>
        <button v-if="index < nodes.length - 1" class="agent-flowchart__connector mx-auto grid h-9 w-7 place-items-center border-0 bg-transparent" type="button" :aria-label="`Add after ${node.label}`" @click="emit('add', node.id)">
          <image class="h-3.5 w-3.5" :src="agentPlusIcon" mode="aspectFit" aria-hidden="true" />
        </button>
      </template>
    </view>
  </view>
</template>

<style scoped>
.agent-flowchart button::after {
  border: 0;
}

.agent-flowchart__connector {
  background: linear-gradient(#cbd5e1, #cbd5e1) center / 1px 100% no-repeat;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
