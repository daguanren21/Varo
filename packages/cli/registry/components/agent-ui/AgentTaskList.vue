<script setup lang="ts">
import VProgress from '../ui/v-progress.vue'
import type { AgentTask } from './types'

withDefaults(
  defineProps<{
    tasks?: AgentTask[]
    title?: string
  }>(),
  {
    tasks: () => [],
    title: '执行计划'
  }
)

function indexClass(status: AgentTask['status']) {
  if (status === 'completed') return 'border-green-600 bg-green-600 text-white'
  if (status === 'running') return 'border-teal-700 bg-emerald-50 text-teal-700'
  if (status === 'failed') return 'border-red-600 bg-red-50 text-red-600'
  return 'border-slate-300 text-slate-500'
}
</script>

<template>
  <view class="agent-tasks overflow-hidden rounded-[14px] border border-slate-200 bg-white" aria-live="polite">
    <view class="flex min-h-11 items-center justify-between gap-3 border-b border-slate-100 px-[13px]">
      <text class="text-[13px] font-bold text-slate-950">{{ title }}</text>
      <text class="text-[11px] tabular-nums text-slate-400">{{ tasks.filter((task) => task.status === 'completed').length }}/{{ tasks.length }}</text>
    </view>
    <view class="grid divide-y divide-slate-50">
      <view v-for="(task, index) in tasks" :key="task.id" class="flex min-h-[50px] items-center gap-2.5 px-[13px] py-2">
        <view :class="['grid h-6 w-6 flex-none place-items-center rounded-full border text-[10px] font-bold', indexClass(task.status)]" aria-hidden="true">
          <text>{{ task.status === 'completed' ? '✓' : index + 1 }}</text>
        </view>
        <view class="grid min-w-0 flex-1 gap-1.5">
          <view class="flex items-baseline justify-between gap-2.5">
            <text class="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-slate-700">{{ task.title }}</text>
            <text v-if="task.meta" class="flex-none text-[10px] text-slate-400">{{ task.meta }}</text>
          </view>
          <VProgress
            v-if="task.progress !== undefined"
            :percentage="task.progress"
            :show-text="false"
            :stroke-width="4"
            :status="task.status === 'failed' ? 'danger' : task.status === 'completed' ? 'success' : 'active'"
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
