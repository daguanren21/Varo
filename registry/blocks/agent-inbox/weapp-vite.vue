<script setup lang="ts">
import type { AgentInboxTask } from './agent-inbox.types'
import { computed, ref } from 'wevu'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import AgentInboxActions from './agent-inbox-actions.vue'

defineOptions({ properties: { tasks: { type: Array, value: [] } } })
const props = withDefaults(defineProps<{
  tasks: readonly AgentInboxTask[]
  title?: string
  disabled?: boolean
}>(), { tasks: () => [], title: '任务收件箱', disabled: false })
const emit = defineEmits<{
  open: [id: string]
  retry: [id: string]
}>()

const filters = [
  { id: 'all', label: '全部' },
  { id: 'pending', label: '待处理' },
  { id: 'running', label: '运行中' },
  { id: 'failed', label: '失败' },
  { id: 'completed', label: '已完成' },
] as const
type InboxFilter = typeof filters[number]['id']
const neutralStatus = 'bg-[var(--varo-ui-surface-muted)] text-[var(--varo-ui-text-regular)]'
const statuses = {
  'queued': { label: '已排队', filter: 'pending', color: neutralStatus },
  'needs-input': { label: '待补充信息', filter: 'pending', color: 'bg-[var(--varo-ui-warning-soft)] text-[var(--varo-ui-warning-text)]' },
  'running': { label: '运行中', filter: 'running', color: 'bg-[var(--varo-ui-primary-soft)] text-[var(--varo-ui-primary-text)]' },
  'failed': { label: '失败', filter: 'failed', color: 'bg-[var(--varo-ui-danger-soft)] text-[var(--varo-ui-danger-text)]' },
  'completed': { label: '已完成', filter: 'completed', color: 'bg-[var(--varo-ui-success-soft)] text-[var(--varo-ui-success-text)]' },
  'cancelled': { label: '已取消', filter: null, color: neutralStatus },
} satisfies Record<AgentInboxTask['status'], { label: string, filter: Exclude<InboxFilter, 'all'> | null, color: string }>

const selectedFilter = ref<InboxFilter>('all')
const counts = computed(() => {
  const totals = { all: props.tasks.length, pending: 0, running: 0, failed: 0, completed: 0 }
  for (const task of props.tasks) {
    const filter = statuses[task.status].filter
    if (filter !== null) { totals[filter]++ }
  }
  return totals
})
const filterChoices = computed(() => filters.map(({ id, label }) => {
  const selected = id === selectedFilter.value
  return {
    id,
    label: `${label} (${counts.value[id]})`,
    selected,
    className: selected ? '!border-[var(--varo-ui-primary-text)] !bg-[var(--varo-ui-primary-soft)] !text-[var(--varo-ui-primary-text)]' : '',
  }
}))

function canRetry(task: AgentInboxTask) {
  return task.status === 'failed' && task.retryable === true
}

const rows = computed(() => {
  const { disabled, tasks } = props
  const visible = []
  const filter = selectedFilter.value
  for (const task of tasks) {
    const status = statuses[task.status]
    if (filter !== 'all' && status.filter !== filter) { continue }
    const retryable = canRetry(task)
    visible.push({
      id: task.id,
      title: task.title,
      detail: task.detail ?? '',
      status: task.status,
      statusLabel: status.label,
      statusAriaLabel: `状态：${status.label}`,
      statusColor: status.color,
      openLabel: `打开 ${task.title}`,
      retryable,
      retryLabel: retryable ? `重试 ${task.title}` : '',
      disabled: disabled || task.disabled === true,
    })
  }
  return visible
})
const emptyText = computed(() => props.tasks.length ? '当前筛选下暂无任务' : '暂无任务')

function selectFilter(id: InboxFilter) {
  selectedFilter.value = id
}

function request({ id, action }: { id: string, action: 'open' | 'retry' }) {
  if (props.disabled) { return }
  const task = props.tasks.find(item => item.id === id)
  if (!task || task.disabled === true) { return }
  if (action === 'open') { emit('open', task.id) }
  else if (canRetry(task)) { emit('retry', task.id) }
}
</script>

<template>
  <VCard variant="outline">
    <view class="grid min-w-0 gap-4 text-sm">
      <text class="block break-words text-lg font-semibold">
        {{ title }}
      </text>
      <view class="flex flex-wrap gap-2" role="group" aria-label="任务筛选">
        <VButton
          v-for="choice in filterChoices"
          :key="choice.id"
          variant="outline"
          tone="default"
          :class-name="choice.className"
          :aria-label="choice.label"
          :aria-pressed="choice.selected"
          @click="selectFilter(choice.id)"
        >
          {{ choice.label }}
        </VButton>
      </view>

      <view v-if="rows.length" role="list">
        <view
          v-for="row in rows"
          :key="row.id"
          class="grid min-w-0 gap-2 border-t border-[var(--varo-ui-border-lighter)] py-3"
          role="listitem"
          :data-inbox-task="row.id"
          :data-status="row.status"
        >
          <view class="flex min-w-0 flex-wrap items-start justify-between gap-2">
            <text class="min-w-0 flex-1 break-words text-base font-semibold">
              {{ row.title }}
            </text>
            <text class="rounded-full px-2 py-1 text-xs font-medium" :class="row.statusColor" :aria-label="row.statusAriaLabel">
              {{ row.statusLabel }}
            </text>
          </view>
          <text v-if="row.detail" class="block break-words whitespace-pre-wrap text-[var(--varo-ui-text-regular)]">
            {{ row.detail }}
          </text>
          <AgentInboxActions
            :key="row.id"
            :task-id="row.id"
            :open-label="row.openLabel"
            :retry-label="row.retryLabel"
            :retryable="row.retryable"
            :disabled="row.disabled"
            @request="request"
          />
        </view>
      </view>
      <text v-else class="block text-[var(--varo-ui-text-regular)]" role="status">
        {{ emptyText }}
      </text>
    </view>
  </VCard>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
