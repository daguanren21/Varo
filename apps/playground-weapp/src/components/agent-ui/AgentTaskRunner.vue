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
  )
})
const canCancel = computed(() => props.busy || props.tasks.some(task => task.status === 'running'))
</script>

<template>
  <view class="agent-task-runner box-border grid w-full min-w-0 max-w-full gap-2.5 overflow-hidden">
    <AgentTaskList class="block w-full min-w-0 max-w-full overflow-hidden" :tasks="tasks" :title="title" />

    <view v-if="actionableTasks.length || canCancel" class="overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)]">
      <view v-if="actionableTasks.length" class="grid gap-1 p-2">
        <view
          v-for="task in actionableTasks"
          :key="task.id"
          class="flex min-h-[56px] items-center gap-2.5 rounded-xl bg-[var(--varo-agent-surface-strong)] px-2.5 py-2"
        >
          <view class="grid min-w-0 flex-1 gap-0.5">
            <text class="truncate text-[12px] font-semibold text-[var(--varo-agent-foreground)]">
              {{ task.title }}
            </text>
            <text v-if="task.description" class="text-[11px] leading-4 text-[var(--varo-agent-muted)]">
              {{ task.description }}
            </text>
            <text class="text-[10px] font-semibold text-[var(--varo-agent-text)]">
              {{ task.status === 'failed' ? '执行失败' : '等待确认' }}
            </text>
          </view>
          <button
            v-if="task.status === 'failed'"
            class="agent-task-runner__action"
            type="button"
            :aria-label="`重试${task.title}`"
            hover-class="agent-task-runner__action--pressed"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="emit('retry', task)"
          >
            重试
          </button>
          <button
            v-else
            class="agent-task-runner__action agent-task-runner__action--primary"
            type="button"
            :aria-label="`批准${task.title}`"
            hover-class="agent-task-runner__action--pressed"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="emit('approve', task)"
          >
            批准
          </button>
        </view>
      </view>

      <view v-if="canCancel" class="flex min-h-[60px] items-center justify-between gap-3 border-t border-[var(--varo-agent-border)] px-[13px] py-2">
        <text class="text-[11px] text-[var(--varo-agent-muted)]">
          任务正在执行
        </text>
        <button
          class="agent-task-runner__action agent-task-runner__action--danger"
          type="button"
          aria-label="取消当前任务"
          hover-class="agent-task-runner__action--pressed"
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

<style scoped>
.agent-task-runner__action {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 36px;
  margin: 0;
  padding: 0 10px;
  font-size: 11px;
  line-height: 1;
  font-weight: 700;
  color: var(--varo-agent-text);
  background: transparent;
  border: 0;
  border-radius: 8px;
}

.agent-task-runner__action::before {
  position: absolute;
  inset: -4px;
  content: '';
}

.agent-task-runner__action::after {
  border: 0;
}

.agent-task-runner__action--primary {
  color: var(--varo-agent-primary);
}

.agent-task-runner__action--danger {
  color: var(--varo-agent-danger);
  background: transparent;
}

.agent-task-runner__action--pressed {
  opacity: 0.82;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
