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

const rootClass = computed(() => cn('agent-flowchart', props.className))
const countLabel = computed(() => `${props.nodes.length} 个步骤`)
const displayNodes = computed(() =>
  props.nodes.map((node, index) => ({
    ...node,
    indexLabel: String(index + 1).padStart(2, '0'),
    typeLabel: node.type === 'trigger'
      ? '触发'
      : node.type === 'condition'
        ? '条件'
        : node.type === 'action'
          ? '动作'
          : '结果',
    statusLabel: node.status === 'completed'
      ? 'Completed'
      : node.status === 'running'
        ? 'Running'
        : node.status === 'failed'
          ? 'Failed'
          : 'Waiting',
  })),
)

function nodeClass(type: AgentFlowNode['type']) {
  return cn('agent-native-button agent-native-button--block agent-flowchart__node', `is-${type}`)
}

function statusClass(status?: AgentAdvancedStatus) {
  return cn(
    'agent-flowchart__status-dot',
    status === 'completed' && 'is-completed',
    status === 'running' && 'is-running',
    status === 'failed' && 'is-failed',
  )
}

function selectNode(id: string) {
  const node = props.nodes.find(entry => entry.id === id)
  if (node) {
    emit('select', node)
  }
}
</script>

<template>
  <view :class="rootClass">
    <view class="agent-flowchart__header">
      <view class="agent-flowchart__heading">
        <text class="agent-flowchart__title">
          {{ title }}
        </text>
        <text class="agent-flowchart__count">
          {{ countLabel }}
        </text>
      </view>
      <button class="agent-native-button agent-flowchart__add" type="button" @click="emit('add', undefined)">
        <image class="agent-flowchart__add-icon" :src="agentPlusIcon" mode="aspectFit" aria-hidden="true" />
        <text>Step</text>
      </button>
    </view>

    <view class="agent-flowchart__canvas">
      <template v-for="(node, index) in displayNodes" :key="node.id">
        <button
          :class="nodeClass(node.type)"
          type="button"
          :data-type="node.type"
          :data-status="node.status || 'waiting'"
          @click="selectNode(node.id)"
        >
          <view class="agent-flowchart__node-head">
            <text class="agent-flowchart__index" aria-hidden="true">
              {{ node.indexLabel }}
            </text>
            <text class="agent-flowchart__type">
              {{ node.typeLabel }}
            </text>
            <view v-if="node.status" class="agent-advanced__status" :data-status="node.status">
              <view :class="statusClass(node.status)" aria-hidden="true" />
              <text>{{ node.statusLabel }}</text>
            </view>
          </view>
          <text class="agent-flowchart__name">
            {{ node.label }}
          </text>
          <text v-if="node.detail" class="agent-flowchart__detail">
            {{ node.detail }}
          </text>
        </button>
        <button
          v-if="index < displayNodes.length - 1"
          class="agent-native-button agent-flowchart__connector"
          type="button"
          :aria-label="`Add after ${node.label}`"
          @click="emit('add', node.id)"
        >
          <image class="agent-flowchart__add-icon" :src="agentPlusIcon" mode="aspectFit" aria-hidden="true" />
        </button>
      </template>
    </view>
  </view>
</template>

<style>
.agent-flowchart {
  overflow: hidden;
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 18px;
}

.agent-flowchart__header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  padding: 0 14px;
  border-bottom: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-flowchart__heading {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.agent-flowchart__title {
  font-size: 13px;
  font-weight: 760;
  color: var(--varo-agent-foreground, #172033);
}

.agent-flowchart__count,
.agent-flowchart__detail {
  font-size: 11px;
  color: var(--varo-agent-muted, #667085);
}

.agent-flowchart__add {
  display: flex;
  gap: 6px;
  align-items: center;
  min-height: 32px;
  padding: 0 9px;
  font-size: 11px;
  font-weight: 750;
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 9px;
}

.agent-flowchart__add-icon {
  width: 13px;
  height: 13px;
}

.agent-flowchart__canvas {
  display: grid;
  justify-items: center;
  padding: 24px;
}

.agent-flowchart__node {
  display: grid;
  gap: 6px;
  width: 100%;
  max-width: 320px;
  padding: 12px 14px;
  text-align: left;
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 14px;
}

.agent-flowchart__node.is-trigger {
  border-color: var(--varo-agent-primary, #0f766e);
}

.agent-flowchart__node.is-condition {
  border-color: var(--varo-agent-warning, #d97706);
}

.agent-flowchart__node.is-action {
  border-color: var(--varo-agent-source-violet, #7c3aed);
}

.agent-flowchart__node.is-result {
  border-color: var(--varo-agent-success, #16a34a);
}

.agent-flowchart__node-head {
  display: flex;
  gap: 8px;
  align-items: center;
}

.agent-flowchart__index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 10px;
  font-weight: 800;
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-primary-soft, #ccfbf1);
  border-radius: 7px;
}

.agent-flowchart__type {
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 750;
  color: var(--varo-agent-muted, #667085);
  background: var(--varo-agent-fill, #f1f5f9);
  border-radius: 999px;
}

.agent-advanced__status {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-left: auto;
  font-size: 11px;
  font-weight: 750;
  color: var(--varo-agent-muted, #667085);
}

.agent-flowchart__status-dot {
  width: 7px;
  height: 7px;
  background: var(--varo-agent-border-strong, #cbd5e1);
  border-radius: 999px;
}

.agent-flowchart__status-dot.is-completed {
  background: var(--varo-agent-success, #16a34a);
}

.agent-flowchart__status-dot.is-running {
  background: var(--varo-agent-primary, #0f766e);
}

.agent-flowchart__status-dot.is-failed {
  background: var(--varo-agent-danger, #dc2626);
}

.agent-flowchart__name {
  font-size: 13px;
  font-weight: 760;
  color: var(--varo-agent-foreground, #172033);
}

.agent-flowchart__connector {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 36px;
  background: linear-gradient(var(--varo-agent-border, #dbe3ea), var(--varo-agent-border, #dbe3ea)) center / 1px 100%
    no-repeat;
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
