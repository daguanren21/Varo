<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentInsightItem } from './advanced-types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { agentChevronDownIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    current?: number
    insights?: AgentInsightItem[]
    title?: string
  }>(),
  {
    current: 0,
    insights: () => [],
    title: 'Insights',
  },
)

const emit = defineEmits<{
  'action': [item: AgentInsightItem]
  'update:current': [value: number]
}>()

const active = computed(() =>
  props.insights[Math.min(Math.max(0, props.current), Math.max(0, props.insights.length - 1))],
)
const rootClass = computed(() =>
  cn(
    'agent-insight-card overflow-hidden rounded-2xl border bg-[var(--varo-agent-surface)] shadow-sm',
    active.value?.tone === 'success' && 'border-[var(--varo-agent-success)]',
    active.value?.tone === 'warning' && 'border-[var(--varo-agent-warning)]',
    active.value?.tone === 'danger' && 'border-[var(--varo-agent-danger)]',
    (!active.value?.tone || active.value.tone === 'default') && 'border-[var(--varo-agent-border)]',
    props.className,
  ),
)
const activeTone = computed(() => active.value?.tone || 'default')

function move(delta: number) {
  if (!props.insights.length) { return }
  emit('update:current', (props.current + delta + props.insights.length) % props.insights.length)
}
</script>

<template>
  <view :class="rootClass" :data-tone="activeTone">
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] px-[13px]">
      <text class="text-xs font-bold text-[var(--varo-agent-foreground)]">
        {{ title }}
      </text>
      <text class="text-[11px] tabular-nums text-[var(--varo-agent-muted)]">
        {{ insights.length ? current + 1 : 0 }}/{{ insights.length }}
      </text>
    </view>

    <view v-if="active" class="relative grid min-h-32 place-content-center gap-2 px-5 py-5 text-center">
      <text v-if="active.label" class="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--varo-agent-muted)]">
        {{ active.label }}
      </text>
      <text class="max-w-[520px] text-[15px] font-bold leading-6 text-[var(--varo-agent-foreground)]">
        {{ active.description }}
      </text>
      <text v-if="active.value" class="text-2xl font-black tabular-nums text-[var(--varo-agent-primary)]">
        {{ active.value }}
      </text>
    </view>
    <view v-else class="grid min-h-32 place-items-center text-[12px] text-[var(--varo-agent-muted)]">
      No insights
    </view>

    <view class="flex min-h-12 items-center justify-between gap-3 border-t border-[var(--varo-agent-border)] px-3">
      <view class="flex gap-1.5">
        <button class="grid h-8 w-8 place-items-center rounded-lg border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)]" type="button" aria-label="Previous insight" @click="move(-1)">
          <image class="h-3.5 w-3.5 rotate-90" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
        </button>
        <button class="grid h-8 w-8 place-items-center rounded-lg border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)]" type="button" aria-label="Next insight" @click="move(1)">
          <image class="h-3.5 w-3.5 -rotate-90" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
        </button>
      </view>
      <button v-if="active?.action" class="min-h-8 rounded-lg border border-[var(--varo-agent-primary)] bg-[var(--varo-agent-primary)] px-3 text-[11px] font-bold text-white" type="button" @click="emit('action', active)">
        {{ active.action }}
      </button>
    </view>
  </view>
</template>

<style scoped>
.agent-insight-card button::after {
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
