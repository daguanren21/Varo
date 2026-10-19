<script setup lang="ts">
import type { AgentActivityItem } from '../components/agent-ui/advanced-types'
import type { AgentTraceStep } from '../components/agent-ui/types'
import { computed, shallowRef } from 'vue'
import { AgentActivity, AgentToolResult } from '../components/agent-ui/advanced'
import { AgentThinking } from '../components/agent-ui/conversation'
import { VButton } from '../components/ui/button'

const originalSteps: AgentTraceStep[] = [
  { id: 'context', title: '整理上下文', status: 'running', content: '正在整理产品说明与两条候选来源。展开状态只控制这段文字的显示。', duration: '1.2s' },
  { id: 'summary', title: '生成摘要', status: 'failed', detail: '应用报告摘要生成失败。可查看记录，组件不会自行重试任务。' },
  { id: 'ready', title: '准备展示结果', status: 'waiting' },
]
const steps = shallowRef(originalSteps)
const items = computed<AgentActivityItem[]>(() => steps.value.map(step => ({ ...step, detail: step.detail ?? step.content, kind: step.id === 'context' ? 'reasoning' : 'tool' })))
const thinkingIds = shallowRef<string[]>([])
const activityIds = shallowRef<string[]>([])
const toolOpen = shallowRef(false)
const toolStatus = shallowRef<'running' | 'failed'>('running')
const rejectNext = shallowRef(false)
const requests = shallowRef(0)
const lastRequest = shallowRef('尚未请求展开')
const rejectLabel = computed(() => rejectNext.value ? '下一次将拒绝（点击取消）' : '拒绝下一次展开请求')
const statusLabel = computed(() => toolStatus.value === 'running' ? '切换为失败状态' : '切换为进行中状态')
const removed = computed(() => !steps.value.some(step => step.id === 'context'))
const removalLabel = computed(() => removed.value ? '恢复上下文行' : '移除上下文行')
const acceptedState = computed(() => `思考：${thinkingIds.value.join(', ') || '全部关闭'}；活动：${activityIds.value.join(', ') || '全部关闭'}；工具：${toolOpen.value ? '展开' : '关闭'}`)

function updateRows(kind: 'thinking' | 'activity', ids: string[]) {
  requests.value += 1
  if (rejectNext.value) {
    rejectNext.value = false
    lastRequest.value = '父级已拒绝本次行展开请求，显示保持不变。'
    return
  }
  if (kind === 'thinking') { thinkingIds.value = ids }
  else { activityIds.value = ids }
  lastRequest.value = `已接纳${kind === 'thinking' ? '思考' : '活动'}行展开请求。`
}

function updateTool(open: boolean) {
  requests.value += 1
  if (rejectNext.value) {
    rejectNext.value = false
    lastRequest.value = '父级已拒绝本次工具展开请求，显示保持不变。'
    return
  }
  toolOpen.value = open
  lastRequest.value = `工具结果已${open ? '展开' : '关闭'}。`
}

function toggleRemoval() {
  steps.value = removed.value ? originalSteps : steps.value.filter(step => step.id !== 'context')
}
</script>

<template>
  <main class="box-border min-h-screen min-w-0 bg-[var(--varo-ui-surface)] p-4 text-[var(--varo-ui-text)]">
    <div class="mx-auto grid max-w-3xl min-w-0 gap-5">
      <header class="grid gap-2">
        <h1 class="m-0 text-xl font-bold">
          Agent 详情展开
        </h1>
        <p class="m-0 text-sm leading-6 text-[var(--varo-ui-text-muted)]">
          分别打开两行，重排后仍保留原来的展开项。父级可以拒绝下一次请求；状态只用于展示。
        </p>
      </header>
      <div class="flex flex-wrap gap-2">
        <VButton variant="outline" size="sm" @click="steps = [...steps].reverse()">
          重排行
        </VButton>
        <VButton variant="outline" size="sm" @click="toggleRemoval">
          {{ removalLabel }}
        </VButton>
        <VButton variant="outline" size="sm" @click="rejectNext = !rejectNext">
          {{ rejectLabel }}
        </VButton>
      </div>
      <div class="grid gap-1 rounded-xl bg-[var(--varo-ui-surface-muted)] p-3 text-xs leading-5" aria-live="polite">
        <p class="m-0 break-words" data-disclosure-state>
          {{ acceptedState }}
        </p>
        <p class="m-0">
          请求次数：{{ requests }}。{{ lastRequest }}
        </p>
      </div>
      <section class="grid min-w-0 gap-2" aria-label="可展开思考步骤">
        <h2 class="m-0 text-base font-semibold">
          思考步骤 · 独立展开
        </h2>
        <AgentThinking :steps="steps" :expanded-ids="thinkingIds" expandable default-open label="分析与生成" @update:expanded-ids="updateRows('thinking', $event)" />
      </section>
      <section class="grid min-w-0 gap-2" aria-label="可展开活动记录">
        <h2 class="m-0 text-base font-semibold">
          活动记录 · 独立展开
        </h2>
        <AgentActivity :items="items" :expanded-ids="activityIds" expandable title="本次活动" @update:expanded-ids="updateRows('activity', $event)" />
      </section>
      <section class="grid min-w-0 gap-2" aria-label="受控工具结果">
        <h2 class="m-0 text-base font-semibold">
          工具结果 · 父级控制
        </h2>
        <VButton variant="outline" size="sm" @click="toolStatus = toolStatus === 'running' ? 'failed' : 'running'">
          {{ statusLabel }}
        </VButton>
        <AgentToolResult name="source.lookup" :status="toolStatus" :open="toolOpen" output="已找到两条候选来源。这里展示应用提供的记录。" @update:open="updateTool" @retry="lastRequest = '收到重试意图；本演示只展示记录。'" />
      </section>
      <section class="grid min-w-0 gap-3" aria-label="默认展示行为">
        <h2 class="m-0 text-base font-semibold">
          默认展示 · 无行展开按钮
        </h2>
        <AgentThinking :steps="originalSteps" default-open label="默认思考分组" />
        <AgentActivity :items="items" title="默认活动列表" />
        <AgentToolResult name="summary.generate" status="failed" output="初始失败会自动展开；关闭后不会由状态持续重新打开。" @retry="lastRequest = '收到重试意图；本演示只展示记录。'" />
      </section>
    </div>
  </main>
</template>
