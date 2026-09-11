<script setup lang="ts">
import type { AgentTask } from './types'
import { computed } from 'wevu'
import { agentCheckIcon, agentCloseIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    tasks?: AgentTask[]
    title?: string
  }>(),
  {
    tasks: () => [],
    title: '执行计划',
  },
)

const completedCount = computed(() => props.tasks.filter(task => task.status === 'completed').length)
const currentTask = computed(() => props.tasks.find(task => task.status === 'running' || task.status === 'failed'))
const headingHint = computed(() => {
  if (currentTask.value?.status === 'failed') {
    return `阻塞于 ${currentTask.value.title}`
  }
  if (currentTask.value) {
    return `正在执行 ${currentTask.value.title}`
  }
  if (props.tasks.length && completedCount.value === props.tasks.length) {
    return '全部完成'
  }
  return '等待开始'
})
const displayTasks = computed(() =>
  props.tasks.map((task, index) => {
    const ariaCurrent: 'step' | undefined = task.status === 'running' ? 'step' : undefined
    return {
      ...task,
      ariaCurrent,
      indexLabel: String(index + 1),
      itemClass: `agent-task-list__item is-${task.status}`,
      progressWidth: task.progress === undefined ? '' : `${Math.min(100, Math.max(0, task.progress))}%`,
      statusLabel: task.status === 'completed'
        ? '已完成'
        : task.status === 'failed'
          ? '失败'
          : task.status === 'running'
            ? '进行中'
            : task.status === 'waiting'
              ? '等待中'
              : '待开始',
    }
  }),
)
</script>

<template>
  <view class="agent-task-list" aria-live="polite">
    <view class="agent-task-list__header">
      <view class="agent-task-list__heading">
        <text class="agent-task-list__title">
          {{ title }}
        </text>
        <text class="agent-task-list__hint">
          {{ headingHint }}
        </text>
      </view>
      <text class="agent-task-list__count">
        {{ completedCount }}/{{ tasks.length }}
      </text>
    </view>
    <view class="agent-task-list__body">
      <view
        v-for="task in displayTasks"
        :key="task.id"
        :class="task.itemClass"
        :data-status="task.status"
        :aria-current="task.ariaCurrent"
      >
        <view class="agent-task-list__marker" aria-hidden="true">
          <image v-if="task.status === 'completed'" class="agent-task-list__icon" :src="agentCheckIcon" mode="aspectFit" />
          <image v-else-if="task.status === 'failed'" class="agent-task-list__icon" :src="agentCloseIcon" mode="aspectFit" />
          <view v-else-if="task.status === 'running'" class="agent-task-list__pulse" />
          <text v-else>
            {{ task.indexLabel }}
          </text>
        </view>
        <view class="agent-task-list__copy">
          <view class="agent-task-list__row">
            <text class="agent-task-list__name">
              {{ task.title }}
            </text>
            <view class="agent-task-list__meta">
              <text class="agent-task-list__chip">
                {{ task.statusLabel }}
              </text>
              <text v-if="task.meta" class="agent-task-list__duration">
                {{ task.meta }}
              </text>
            </view>
          </view>
          <text v-if="task.description" class="agent-task-list__description">
            {{ task.description }}
          </text>
          <view v-if="task.progressWidth" class="agent-task-list__track" aria-hidden="true">
            <view class="agent-task-list__fill" :style="`width:${task.progressWidth}`" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style>
.agent-task-list {
  overflow: hidden;
  color: var(--varo-agent-foreground, #172033);
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 16px;
}

.agent-task-list__header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 52px;
  padding: 12px 14px 11px;
  border-bottom: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-task-list__heading {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.agent-task-list__title {
  font-size: 13px;
  font-weight: 760;
  line-height: 18px;
}

.agent-task-list__hint,
.agent-task-list__count,
.agent-task-list__duration,
.agent-task-list__description {
  font-size: 11px;
  line-height: 16px;
  color: var(--varo-agent-muted, #667085);
}

.agent-task-list__count,
.agent-task-list__duration {
  flex: none;
  font-variant-numeric: tabular-nums;
}

.agent-task-list__body {
  display: grid;
  padding: 6px 14px 12px 18px;
}

.agent-task-list__item {
  position: relative;
  min-height: 52px;
  padding: 10px 0 10px 16px;
  border-left: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-task-list__marker {
  position: absolute;
  top: 14px;
  left: -11px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 10px;
  font-weight: 800;
  color: var(--varo-agent-muted, #667085);
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 999px;
}

.agent-task-list__item.is-completed .agent-task-list__marker {
  color: var(--varo-agent-success, #16a34a);
  background: var(--varo-agent-success-soft, #dcfce7);
  border-color: var(--varo-agent-success, #16a34a);
}

.agent-task-list__item.is-running .agent-task-list__marker {
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-primary-soft, #ccfbf1);
  border-color: var(--varo-agent-primary, #0f766e);
}

.agent-task-list__item.is-failed .agent-task-list__marker {
  color: var(--varo-agent-danger, #dc2626);
  background: var(--varo-agent-danger-soft, #fee2e2);
  border-color: var(--varo-agent-danger, #dc2626);
}

.agent-task-list__icon {
  width: 12px;
  height: 12px;
}

.agent-task-list__pulse {
  width: 7px;
  height: 7px;
  background: currentcolor;
  border-radius: 999px;
  animation: agent-task-list-pulse 1s ease-in-out infinite;
}

.agent-task-list__copy {
  display: grid;
  flex: 1;
  gap: 5px;
  min-width: 0;
}

.agent-task-list__row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
}

.agent-task-list__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
  white-space: nowrap;
}

.agent-task-list__item.is-waiting .agent-task-list__name,
.agent-task-list__item.is-idle .agent-task-list__name {
  color: var(--varo-agent-muted, #667085);
}

.agent-task-list__meta {
  display: flex;
  flex: none;
  gap: 6px;
  align-items: center;
}

.agent-task-list__chip {
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 750;
  line-height: 14px;
  color: var(--varo-agent-muted, #667085);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 999px;
}

.agent-task-list__item.is-completed .agent-task-list__chip {
  color: var(--varo-agent-success, #16a34a);
  background: var(--varo-agent-success-soft, #dcfce7);
}

.agent-task-list__item.is-running .agent-task-list__chip {
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-primary-soft, #ccfbf1);
}

.agent-task-list__item.is-failed .agent-task-list__chip {
  color: var(--varo-agent-danger, #dc2626);
  background: var(--varo-agent-danger-soft, #fee2e2);
}

.agent-task-list__track {
  width: 100%;
  height: 4px;
  overflow: hidden;
  background: var(--varo-agent-fill, #f1f5f9);
  border-radius: 999px;
}

.agent-task-list__fill {
  height: 100%;
  background: var(--varo-agent-primary, #0f766e);
  border-radius: inherit;
}

.agent-task-list__item.is-completed .agent-task-list__fill {
  background: var(--varo-agent-success, #16a34a);
}

.agent-task-list__item.is-failed .agent-task-list__fill {
  background: var(--varo-agent-danger, #dc2626);
}

.agent-task-list__item.is-running {
  background: color-mix(in srgb, var(--varo-agent-primary-soft, #ccfbf1) 42%, transparent);
  border-radius: 0 12px 12px 0;
}

@keyframes agent-task-list-pulse {
  50% {
    opacity: 0.35;
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-task-list__pulse {
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
