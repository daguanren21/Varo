<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentAdvancedStatus } from './advanced-types'
import { computed, shallowRef } from 'wevu'
import { cn } from '../../lib/cn'

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
    status: 'completed',
  },
)

const emit = defineEmits<{
  'retry': []
  'update:open': [value: boolean]
}>()

const open = shallowRef(props.defaultOpen || props.status === 'running' || props.status === 'failed')
const meta = computed(() => [props.duration, props.summary].filter(Boolean).join(' · '))
const openAttr = computed(() => String(open.value))
const statusText = computed(() => {
  if (props.status === 'completed') {
    return 'Completed'
  }
  if (props.status === 'failed') {
    return 'Failed'
  }
  if (props.status === 'running') {
    return 'Running'
  }
  return 'Waiting'
})
const rootClass = computed(() => cn('agent-tool-result', !open.value && 'is-closed', props.className))
const headerClass = computed(() =>
  cn('agent-native-button agent-native-button--block agent-tool-result__header'),
)
const statusChipClass = computed(() =>
  cn('agent-tool-result__status', `is-${props.status}`),
)
const dotClass = computed(() =>
  cn(
    'agent-tool-result__status-dot',
    props.status === 'running' && 'agent-tool-result__running',
  ),
)

function toggle() {
  open.value = !open.value
  emit('update:open', open.value)
}
</script>

<template>
  <view :class="rootClass" :data-open="openAttr" :data-status="status">
    <button :class="headerClass" type="button" :aria-expanded="open" @click="toggle">
      <view class="agent-tool-result__command">
        <text class="agent-tool-result__prompt" aria-hidden="true">
          $
        </text>
        <text class="agent-tool-result__name">
          {{ name }}
        </text>
      </view>
      <view class="agent-tool-result__meta">
        <view :class="statusChipClass">
          <view :class="dotClass" aria-hidden="true" />
          <text>{{ statusText }}</text>
        </view>
        <text v-if="meta" class="agent-tool-result__duration">
          {{ meta }}
        </text>
      </view>
    </button>

    <view v-if="open" class="agent-tool-result__body">
      <slot>
        <text class="agent-tool-result__output">
          {{ output }}
        </text>
      </slot>
    </view>

    <button v-if="status === 'failed' && open" class="agent-native-button agent-tool-result__retry" type="button" @click="emit('retry')">
      Retry
    </button>
  </view>
</template>

<style>
.agent-tool-result {
  overflow: hidden;
  color: #dbeafe;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 16px;
}

.agent-tool-result__header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  color: inherit;
  text-align: left;
  background: #111c30;
  border: 0;
  border-bottom: 1px solid #26334a;
}

.agent-tool-result.is-closed .agent-tool-result__header {
  border-bottom-color: transparent;
}

.agent-tool-result__command {
  display: flex;
  gap: 8px;
  align-items: baseline;
  min-width: 0;
}

.agent-tool-result__prompt {
  flex: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  font-weight: 700;
  color: #2dd4bf;
}

.agent-tool-result__name {
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  font-weight: 650;
  color: #f8fafc;
  white-space: nowrap;
}

.agent-tool-result__meta {
  display: flex;
  flex: none;
  gap: 8px;
  align-items: center;
}

.agent-tool-result__status {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 750;
  color: #cbd5e1;
  background: rgb(148 163 184 / 12%);
  border: 1px solid rgb(148 163 184 / 18%);
  border-radius: 999px;
}

.agent-tool-result__status.is-completed,
.agent-tool-result__status.is-running {
  color: #5eead4;
  background: rgb(45 212 191 / 12%);
  border-color: rgb(45 212 191 / 24%);
}

.agent-tool-result__status.is-failed {
  color: #fca5a5;
  background: rgb(248 113 113 / 12%);
  border-color: rgb(248 113 113 / 24%);
}

.agent-tool-result__status-dot {
  width: 7px;
  height: 7px;
  background: #94a3b8;
  border-radius: 999px;
}

.agent-tool-result__status.is-completed .agent-tool-result__status-dot,
.agent-tool-result__status.is-running .agent-tool-result__status-dot {
  background: #2dd4bf;
}

.agent-tool-result__status.is-failed .agent-tool-result__status-dot {
  background: #f87171;
}

.agent-tool-result__duration {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #94a3b8;
}

.agent-tool-result__body {
  padding: 12px;
  color: #cbd5e1;
  background: #0f172a;
}

.agent-tool-result__output {
  display: block;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.agent-tool-result__retry {
  min-height: 32px;
  padding: 0 10px;
  margin: 0 12px 12px;
  font-size: 11px;
  font-weight: 750;
  color: #fecaca;
  background: rgb(248 113 113 / 10%);
  border: 1px solid rgb(248 113 113 / 28%);
  border-radius: 9px;
}

.agent-tool-result__running {
  animation: agent-tool-result-pulse 1s ease-in-out infinite;
}

@keyframes agent-tool-result-pulse {
  50% {
    opacity: 0.35;
    transform: scale(0.72);
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-tool-result__running {
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
