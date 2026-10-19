<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentTraceStep } from './types'
import { computed, shallowRef, watch } from 'wevu'
import { cn } from '../../lib/cn'
import { agentChevronDownIcon as chevronIcon, agentSparklesIcon as thinkingIcon } from './agent-icons'
import { agentPartStatusLabels, agentTraceDetail, agentTraceDuration } from './presentation'

defineOptions({
  properties: {
    open: { type: null, value: null },
    expandedIds: { type: null, value: null },
  },
})

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    defaultExpandedIds?: string[]
    expandable?: boolean
    expandedIds?: string[]
    defaultOpen?: boolean
    label?: string
    open?: boolean
    steps?: AgentTraceStep[]
  }>(),
  {
    defaultExpandedIds: () => [],
    expandable: false,
    expandedIds: undefined,
    defaultOpen: false,
    label: '思考过程',
    open: undefined,
    steps: () => [],
  },
)

const emit = defineEmits<{
  'update:open': [open: boolean]
  'update:expandedIds': [ids: string[]]
}>()

const internalOpen = shallowRef(props.defaultOpen)
const internalExpandedIds = shallowRef([...props.defaultExpandedIds])
const expandedIds = computed(() => props.expandedIds ?? internalExpandedIds.value)
watch(() => props.steps.map(step => step.id), (ids) => {
  internalExpandedIds.value = internalExpandedIds.value.filter(id => ids.includes(id))
}, { immediate: true })
const displaySteps = computed(() => props.steps.map((step) => {
  const detail = agentTraceDetail(step)
  const expandable = props.expandable && !!detail
  const expanded = expandedIds.value.includes(step.id)
  return {
    ...step,
    detail,
    durationLabel: agentTraceDuration(step),
    expandable,
    expanded,
    showDetail: !!detail && (!expandable || expanded),
    statusLabel: agentPartStatusLabels[step.status],
    chevronClass: cn('agent-thinking__row-chevron h-4 w-4 flex-none', expanded && 'is-open'),
  }
}))
const currentOpen = computed(() => props.open ?? internalOpen.value)
const completedCount = computed(() => props.steps.filter(step => step.status === 'completed').length)
const rootClass = computed(() =>
  cn(
    'agent-thinking overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] text-[var(--varo-agent-foreground)] shadow-sm',
    currentOpen.value && 'agent-thinking--open',
    props.className,
  ),
)

function toggle() {
  const open = !currentOpen.value
  if (props.open == null) { internalOpen.value = open }
  emit('update:open', open)
}

function toggleStep(step: AgentTraceStep) {
  if (!props.expandable || !agentTraceDetail(step)) { return }
  const next = expandedIds.value.includes(step.id)
    ? expandedIds.value.filter(id => id !== step.id)
    : [...expandedIds.value, step.id]
  if (props.expandedIds == null) { internalExpandedIds.value = next }
  emit('update:expandedIds', next)
}

function dotClass(status: AgentTraceStep['status']) {
  return cn(
    'agent-thinking__dot absolute left-[-5px] top-[15px] box-border h-[9px] w-[9px] rounded-full border-2 border-[var(--varo-agent-border)]',
    status === 'completed' && 'bg-[var(--varo-agent-success)]',
    status === 'running' && 'agent-thinking__running bg-[var(--varo-agent-primary)] shadow-[0_0_0_3px_#ccfbf1]',
    status === 'failed' && 'bg-[var(--varo-agent-danger)]',
    status === 'waiting' && 'bg-[var(--varo-agent-border-strong)]',
  )
}
</script>

<template>
  <view :class="rootClass" :data-open="String(currentOpen)">
    <button
      class="agent-native-button agent-native-button--block agent-thinking__trigger box-border flex min-h-16 items-center gap-3 border-0 bg-[var(--varo-agent-surface)] px-[15px] py-2.5 text-left text-[var(--varo-agent-foreground)]"
      :aria-expanded="currentOpen"
      @click="toggle"
    >
      <view class="agent-thinking__icon grid h-[34px] w-[34px] flex-none place-items-center rounded-[11px] border border-[var(--varo-agent-border-strong)] bg-[var(--varo-agent-success-soft)] shadow-[0_4px_12px_rgba(15,118,110,.1)]" aria-hidden="true">
        <image class="h-[19px] w-[19px]" :src="thinkingIcon" mode="aspectFit" />
      </view>
      <view class="grid min-w-0 flex-1 gap-0.5">
        <text class="truncate text-[13px] font-bold leading-[18px] text-[var(--varo-agent-foreground)]">
          {{ label }}
        </text>
        <text class="text-[12px] leading-4 text-[var(--varo-agent-text)]">
          {{ completedCount }}/{{ steps.length }} 已完成
        </text>
      </view>
      <image class="agent-thinking__chevron h-[17px] w-[17px] flex-none" :src="chevronIcon" mode="aspectFit" aria-hidden="true" />
    </button>

    <view v-if="currentOpen" class="grid border-t border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] pb-[13px] pl-[31px] pr-[15px] pt-[5px]">
      <view v-for="step in displaySteps" :key="step.id" class="agent-thinking__step relative flex min-h-[45px] gap-3 border-l border-[var(--varo-agent-border-strong)] py-[9px] pl-5" :data-status="step.status">
        <text :class="dotClass(step.status)" aria-hidden="true" />
        <view class="grid min-w-0 flex-1 gap-[3px]">
          <button
            v-if="step.expandable"
            class="agent-native-button agent-native-button--block agent-thinking__step-trigger flex min-h-9 items-center justify-between gap-2.5 text-left"
            :aria-expanded="step.expanded"
            @click="toggleStep(step)"
          >
            <text class="min-w-0 break-words text-xs font-semibold leading-[17px] text-[var(--varo-agent-foreground)]">
              {{ step.title }}
            </text>
            <view class="flex flex-none flex-wrap items-center justify-end gap-2 text-[12px] leading-4 text-[var(--varo-agent-text)]">
              <text>{{ step.statusLabel }}</text>
              <text v-if="step.durationLabel">
                {{ step.durationLabel }}
              </text>
              <image :class="step.chevronClass" :src="chevronIcon" mode="aspectFit" aria-hidden="true" />
            </view>
          </button>
          <view v-else class="flex items-center justify-between gap-2.5">
            <text class="text-xs font-semibold leading-[17px] text-[var(--varo-agent-foreground)]">
              {{ step.title }}
            </text>
            <view class="flex items-center gap-2 text-[12px] leading-4 text-[var(--varo-agent-text)]">
              <text v-if="expandable">
                {{ step.statusLabel }}
              </text>
              <text v-if="step.durationLabel">
                {{ step.durationLabel }}
              </text>
            </view>
          </view>
          <text v-if="step.showDetail" class="agent-thinking__detail break-words text-[12px] leading-4 text-[var(--varo-agent-text)]">
            {{ step.detail }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style>
.agent-thinking__step-trigger {
  padding: 0;
  margin: 0;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: 4px;
}

.agent-thinking__step-trigger::after {
  border: 0;
}

.agent-thinking__row-chevron.is-open {
  transform: rotate(180deg);
}

.agent-thinking__trigger::after {
  border: 0;
}

.agent-thinking__chevron {
  transition: transform 200ms ease;
}

.agent-thinking--open .agent-thinking__chevron {
  transform: rotate(180deg);
}

.agent-thinking__running {
  animation: agent-thinking-pulse 1.1s ease-in-out infinite;
}

@keyframes agent-thinking-pulse {
  50% {
    opacity: 0.55;
    transform: scale(0.72);
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-thinking__running {
    animation: none;
  }

  .agent-thinking__chevron {
    transition: none;
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
