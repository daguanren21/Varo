<script setup lang="ts">
import type { AgentDecision, AgentDecisionIntent } from '../../components/agent-ui/agent-decision.types'
import type { AgentInboxTask } from '../../components/blocks/agent-inbox.types'
import { computed, shallowRef } from 'wevu'
import AgentDecisionCard from '../../components/agent-ui/AgentDecisionCard.vue'
import AgentInbox from '../../components/blocks/agent-inbox.vue'
import VButton from '../../components/ui/v-button.vue'

const decision = shallowRef<AgentDecision>({
  id: 'format',
  title: '报告使用什么格式？',
  description: '选择输出形式。回答只更新当前页面中的本地任务。',
  options: [
    { id: 'checklist', label: '核对清单', recommended: true },
    { id: 'summary', label: '简短摘要' },
  ],
  allowCustom: true,
  status: 'pending',
})
const tasks = shallowRef<AgentInboxTask[]>([
  { id: 'format', title: '确认报告格式', detail: '等待你选择报告的输出形式。', status: 'needs-input' },
  { id: 'sources', title: '汇总本地来源', detail: '上次读取没有完成。可重新读取此页的示例资料。', status: 'failed', retryable: true },
  { id: 'outline', title: '准备报告提纲', detail: '提纲已包含目的、依据和结论三部分。', status: 'completed' },
])
const sources = ['申请记录', '核验清单']
const activeId = shallowRef('')
const active = computed(() => tasks.value.find(task => task.id === activeId.value))

function openTask(id: string) {
  if (tasks.value.some(task => task.id === id && !task.disabled)) { activeId.value = id }
}

function retryTask(id: string) {
  const task = tasks.value.find(task => task.id === id)
  if (id !== 'sources' || task?.status !== 'failed' || !task.retryable || task.disabled) { return }
  const detail = `已汇总 ${sources.length} 条资料：${sources.join('、')}。`
  tasks.value = tasks.value.map(task => task.id === id ? { ...task, status: 'completed', detail, retryable: false } : task)
}

function answerDecision({ decisionId, answer }: AgentDecisionIntent) {
  const current = decision.value
  if (activeId.value !== decisionId || current.id !== decisionId || current.status === 'answered') { return }
  const label = answer.kind === 'option'
    ? current.options.find(option => option.id === answer.optionId && !option.disabled)?.label
    : answer.text.trim()
  if (!label) { return }
  if (label.length > 120) {
    decision.value = { ...current, status: 'error', error: '请将格式说明控制在 120 字以内。' }
    return
  }
  decision.value = { ...current, status: 'answered', answer }
  tasks.value = tasks.value.map(task => task.id === decisionId ? { ...task, status: 'completed', detail: `已选择：${label}。` } : task)
}
</script>

<template>
  <view class="box-border grid min-h-screen content-start gap-4 bg-[var(--varo-ui-bg)] p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] text-[var(--varo-ui-text)]">
    <view class="grid gap-2">
      <text class="text-xl font-semibold">
        Agent 任务收件箱
      </text>
      <text class="text-sm text-[var(--varo-ui-text-regular)]">
        本地演示。页面持有任务与结果；组件只发出打开、重试或回答请求。
      </text>
    </view>
    <view v-if="active" class="grid min-w-0 gap-3" data-agent-inbox-demo="task">
      <VButton variant="outline" @click="activeId = ''">
        返回任务列表
      </VButton>
      <text class="text-base font-semibold">
        {{ active.title }}
      </text>
      <AgentDecisionCard v-if="active.id === decision.id" :decision="decision" @answer="answerDecision" />
      <text v-else class="break-words text-sm">
        {{ active.detail }}
      </text>
    </view>
    <AgentInbox v-else :tasks="tasks" @open="openTask" @retry="retryTask" />
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Agent 收件箱",
  "usingComponents": {}
}
</json>
