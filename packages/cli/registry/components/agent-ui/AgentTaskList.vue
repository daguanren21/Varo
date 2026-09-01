<script setup lang="ts">
import type { AgentTask } from './types'
import { computed } from 'wevu'
import VProgress from '../ui/v-progress.vue'
import { agentCheckIcon } from './agent-icons'

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

function indexClass(status: AgentTask['status']) {
  if (status === 'completed') { return 'border-[var(--varo-agent-success)] bg-[var(--varo-agent-success-soft)] text-[var(--varo-agent-success)]' }
  if (status === 'running') { return 'border-[var(--varo-agent-primary)] bg-[var(--varo-agent-primary-soft)] text-[var(--varo-agent-primary)]' }
  if (status === 'failed') { return 'border-[var(--varo-agent-danger)] bg-[var(--varo-agent-danger-soft)] text-[var(--varo-agent-danger)]' }
  return 'border-[var(--varo-agent-border-strong)] text-[var(--varo-agent-text)]'
}

const completedCount = computed(() => props.tasks.filter(task => task.status === 'completed').length)
const displayTasks = computed(() =>
  props.tasks.map(task => ({
    ...task,
    progressStatus: task.status === 'failed' ? 'danger' as const : task.status === 'completed' ? 'success' as const : 'active' as const,
  })),
)
</script>

<template>
  <view class="agent-tasks overflow-hidden rounded-[14px] border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)]" aria-live="polite">
    <view class="flex min-h-11 items-center justify-between gap-3 border-b border-[var(--varo-agent-border)] px-[13px]">
      <text class="text-[13px] font-bold text-[var(--varo-agent-foreground)]">
        {{ title }}
      </text>
      <text class="text-[12px] tabular-nums text-[var(--varo-agent-muted)]">
        {{ completedCount }}/{{ tasks.length }}
      </text>
    </view>
    <view class="grid divide-y divide-slate-50">
      <view v-for="(task, index) in displayTasks" :key="task.id" class="flex min-h-[50px] items-center gap-2.5 px-[13px] py-2">
        <view class="grid h-6 w-6 flex-none place-items-center rounded-full border text-[11px] font-bold" :class="[indexClass(task.status)]" aria-hidden="true">
          <image v-if="task.status === 'completed'" class="h-3.5 w-3.5" :src="agentCheckIcon" mode="aspectFit" />
          <text v-else>
            {{ index + 1 }}
          </text>
        </view>
        <view class="grid min-w-0 flex-1 gap-1.5">
          <view class="flex items-baseline justify-between gap-2.5">
            <text class="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-[var(--varo-agent-foreground)]">
              {{ task.title }}
            </text>
            <text v-if="task.meta" class="flex-none text-[11px] text-[var(--varo-agent-muted)]">
              {{ task.meta }}
            </text>
          </view>
          <VProgress
            v-if="task.progress !== undefined"
            :percentage="task.progress"
            :show-text="false"
            :stroke-width="4"
            :status="task.progressStatus"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
