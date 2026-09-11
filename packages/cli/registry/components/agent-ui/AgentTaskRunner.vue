<script setup lang="ts">
import type { AgentTask } from './types'
import { computed } from 'wevu'
import AgentTaskList from './AgentTaskList.vue'

const props = withDefaults(
  defineProps<{
    busy?: boolean
    tasks?: AgentTask[]
    title?: string
  }>(),
  {
    busy: false,
    tasks: () => [],
    title: '执行计划',
  },
)

const emit = defineEmits<{
  approve: [task: AgentTask]
  cancel: []
  retry: [task: AgentTask]
}>()

const actionableTasks = computed(() => {
  if (props.busy) { return [] }
  return props.tasks.filter(task =>
    (task.status === 'failed' && task.retryable)
    || (task.status === 'waiting' && task.requiresApproval),
  ).map(task => ({
    approveLabel: `批准${task.title}`,
    retryLabel: `重试${task.title}`,
    rowClass: `agent-workspace-card__row is-${task.status}`,
    statusLabel: task.status === 'failed' ? '执行失败' : '等待确认',
    task,
  }))
})
const canCancel = computed(() => props.busy || props.tasks.some(task => task.status === 'running'))
const showControls = computed(() => actionableTasks.value.length > 0 || canCancel.value)
</script>

<template>
  <view class="agent-task-runner">
    <AgentTaskList class="block w-full min-w-0 max-w-full overflow-hidden" :tasks="tasks" :title="title" />

    <view v-if="showControls" class="agent-task-runner__controls">
      <view v-if="actionableTasks.length" class="agent-workspace-card__body">
        <view
          v-for="entry in actionableTasks"
          :key="entry.task.id"
          :class="entry.rowClass"
          :data-status="entry.task.status"
        >
          <view class="agent-workspace-card__copy">
            <text class="agent-workspace-card__name">
              {{ entry.task.title }}
            </text>
            <text v-if="entry.task.description" class="agent-workspace-card__detail">
              {{ entry.task.description }}
            </text>
            <text class="agent-workspace-card__chip">
              {{ entry.statusLabel }}
            </text>
          </view>
          <button
            v-if="entry.task.status === 'failed'"
            class="agent-native-button agent-workspace-card__action agent-workspace-card__action--primary"
            type="button"
            :aria-label="entry.retryLabel"
            hover-class="agent-workspace-card__action--pressed"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="emit('retry', entry.task)"
          >
            重试
          </button>
          <button
            v-else
            class="agent-native-button agent-workspace-card__action agent-workspace-card__action--primary"
            type="button"
            :aria-label="entry.approveLabel"
            hover-class="agent-workspace-card__action--pressed"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="emit('approve', entry.task)"
          >
            批准
          </button>
        </view>
      </view>

      <view v-if="canCancel" class="agent-task-runner__cancel">
        <text class="agent-workspace-card__hint">
          任务正在执行
        </text>
        <button
          class="agent-native-button agent-workspace-card__action agent-workspace-card__action--danger"
          type="button"
          aria-label="取消当前任务"
          hover-class="agent-workspace-card__action--pressed"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="emit('cancel')"
        >
          取消
        </button>
      </view>
    </view>
  </view>
</template>

<style>
.agent-task-runner {
  display: grid;
  gap: 10px;
  overflow: hidden;
}

.agent-task-runner__controls {
  overflow: hidden;
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 16px;
}

.agent-workspace-card__body {
  display: grid;
  padding: 8px 10px 10px;
}

.agent-workspace-card__row {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 58px;
  padding: 9px 10px;
  border-radius: 12px;
}

.agent-workspace-card__row.is-failed {
  background: var(--varo-agent-danger-soft, #fee2e2);
}

.agent-workspace-card__copy {
  display: grid;
  flex: 1;
  gap: 4px;
  min-width: 0;
}

.agent-workspace-card__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
  white-space: nowrap;
}

.agent-workspace-card__detail,
.agent-workspace-card__hint {
  font-size: 11px;
  line-height: 16px;
  color: var(--varo-agent-muted, #667085);
}

.agent-workspace-card__chip {
  width: fit-content;
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 750;
  line-height: 14px;
  color: var(--varo-agent-muted, #667085);
  background: var(--varo-agent-fill, #f1f5f9);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 999px;
}

.agent-workspace-card__row.is-failed .agent-workspace-card__chip {
  color: var(--varo-agent-danger, #dc2626);
  background: var(--varo-agent-danger-soft, #fee2e2);
}

.agent-workspace-card__row.is-waiting .agent-workspace-card__chip {
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-primary-soft, #ccfbf1);
}

.agent-task-runner__cancel {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 8px 14px 10px;
  border-top: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-workspace-card__action {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 36px;
  padding: 0 10px;
  margin: 0;
  font-size: 11px;
  font-weight: 750;
  line-height: 1;
  color: var(--varo-agent-foreground, #172033);
  background: transparent;
  border: 0;
  border-radius: 9px;
}

.agent-workspace-card__action::before {
  position: absolute;
  inset: -4px;
  content: '';
}

.agent-workspace-card__action--primary {
  color: var(--varo-agent-primary, #0f766e);
}

.agent-workspace-card__action--danger {
  color: var(--varo-agent-danger, #dc2626);
}

.agent-workspace-card__action--pressed {
  opacity: 0.82;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
