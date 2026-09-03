<script setup lang="ts">
import type { AgentThreadVersion } from '@varo-ui/ai'
import type {
  AgentContextSource,
  AgentRetrievalItem,
  AgentSourceReceiptItem,
  AgentWorkspacePlacement,
} from '../../components/agent-ui/advanced-types'
import type { AgentTask } from '../../components/agent-ui/types'
import { shallowRef } from 'wevu'
import AgentWorkspace from '../../components/blocks/agent-workspace.vue'

const prompt = shallowRef('')
const placement = shallowRef<AgentWorkspacePlacement>('page')
const open = shallowRef(true)
const activity = shallowRef('来源范围已确认，可以开始执行。')
const sources = shallowRef<AgentContextSource[]>([
  { id: 'support', label: '支持队列', description: '14 条注册问题工单', enabled: true, status: 'available' },
  { id: 'replay', label: '会话回放', description: '18 次失败注册流程', enabled: true, status: 'available' },
  { id: 'drive', label: '产品文档', description: '需要重新连接', enabled: false, status: 'unavailable' },
])
const retrieval = shallowRef<AgentRetrievalItem[]>([
  { id: 'search', title: '检索注册失败工单', detail: '找到 14 条相关记录', sourceId: 'support', status: 'read' },
  { id: 'replay', title: '读取会话回放', detail: '正在分析退出步骤', sourceId: 'replay', status: 'reading' },
  { id: 'docs', title: '核对产品文档', detail: '来源未连接', retryable: true, sourceId: 'drive', status: 'failed' },
])
const receipts: AgentSourceReceiptItem[] = [
  { id: 'support', label: '支持队列', detail: '14 条工单', itemCount: 14, status: 'read' },
  { id: 'replay', label: '会话回放', detail: '18 次会话', itemCount: 18, status: 'read' },
  { id: 'drive', label: '产品文档', detail: '未连接', status: 'skipped' },
]
const tasks = shallowRef<AgentTask[]>([
  { id: 'scope', title: '确认来源范围', meta: '已完成', progress: 100, status: 'completed' },
  { id: 'compare', title: '对比失败路径', description: '工单与回放交叉验证', meta: '执行中', progress: 64, status: 'running' },
  { id: 'patch', title: '生成修复建议', meta: '等待审批', requiresApproval: true, status: 'waiting' },
])
const versions: AgentThreadVersion[] = [
  { id: 'root', label: '初始分析', summary: '注册失败根因', createdAt: '09:32', pinned: true },
  { id: 'retry-copy', parentId: 'root', label: '保守修复', summary: '只调整重试提示', createdAt: '09:38' },
  { id: 'flow-fix', parentId: 'root', label: '流程修复', summary: '修复签名与幂等', createdAt: '09:41' },
]
const messages = [
  { id: 'user-1', role: 'user' as const, content: '分析注册失败并给出可执行修复。', timestamp: '09:31' },
  { id: 'assistant-1', role: 'assistant' as const, content: '我会先确认可读取的来源，再展示检索、执行和回执。', timestamp: '09:32' },
]

function toggleSource(source: AgentContextSource, enabled: boolean) {
  sources.value = sources.value.map(item => item.id === source.id ? { ...item, enabled } : item)
  activity.value = `${source.label}已${enabled ? '加入' : '移出'}上下文。`
}

function setPlacement(next: AgentWorkspacePlacement) {
  placement.value = next
  open.value = true
}

function submit(value: string) {
  activity.value = `已提交：${value}`
  prompt.value = ''
}
</script>

<template>
  <view class="agent-workspace-page box-border min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[var(--varo-ui-bg)] px-4 py-5">
    <view class="box-border mx-auto grid w-full min-w-0 max-w-full gap-4 overflow-hidden">
      <view class="grid gap-2">
        <text class="text-lg font-bold text-[var(--varo-agent-foreground)]">Agent Workspace</text>
        <text class="text-xs leading-5 text-[var(--varo-agent-muted)]">来源授权、检索、任务与会话分支在一次移动工作流中保持可见。</text>
      </view>
      <view class="agent-workspace-page__placements box-border grid w-full min-w-0 max-w-full grid-cols-3 gap-1" role="group" aria-label="Workspace placement">
        <button class="agent-workspace-page__placement box-border m-0 h-11 w-full px-2 text-xs font-bold" :aria-pressed="placement === 'page'" :data-active="String(placement === 'page')" hover-class="agent-workspace-page__placement--pressed" @click="setPlacement('page')">Page</button>
        <button class="agent-workspace-page__placement box-border m-0 h-11 w-full px-2 text-xs font-bold" :aria-pressed="placement === 'docked'" :data-active="String(placement === 'docked')" hover-class="agent-workspace-page__placement--pressed" @click="setPlacement('docked')">Docked</button>
        <button class="agent-workspace-page__placement box-border m-0 h-11 w-full px-2 text-xs font-bold" :aria-pressed="placement === 'sheet'" :data-active="String(placement === 'sheet')" hover-class="agent-workspace-page__placement--pressed" @click="setPlacement('sheet')">Sheet</button>
      </view>
      <text class="rounded-xl bg-[var(--varo-agent-fill)] px-3 py-2 text-xs text-[var(--varo-agent-text)]">{{ activity }}</text>
      <AgentWorkspace
        class="block w-full min-w-0 max-w-full overflow-hidden"
        v-model:prompt="prompt"
        :active-version-id="'flow-fix'"
        :context-usage="64"
        :messages="messages"
        :open="open"
        :placement="placement"
        :receipts="receipts"
        :retrieval="retrieval"
        :sources="sources"
        :tasks="tasks"
        :versions="versions"
        subtitle="只读取已授权来源；每一步都可检查、重试或分支。"
        title="注册失败分析"
        @approve-task="activity = `已批准任务：${$event.title}`"
        @branch-version="activity = `从版本 ${$event.label || $event.id} 创建分支`"
        @cancel-task="activity = '已取消当前任务'"
        @close="open = false"
        @connect-receipt="activity = `连接来源：${$event.label}`"
        @connect-source="activity = `连接来源：${$event.label}`"
        @open-receipt="activity = `打开回执：${$event.label}`"
        @pin-version="activity = `固定版本：${$event.label || $event.id}`"
        @retry-retrieval="activity = `重试检索：${$event.title}`"
        @retry-task="activity = `重试任务：${$event.title}`"
        @select-version="activity = `切换版本：${$event.label || $event.id}`"
        @submit="submit"
        @toggle-source="toggleSource"
      />
    </view>
  </view>
</template>

<style scoped>
.agent-workspace-page {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
}

.agent-workspace-page__placements {
  padding: 4px;
  background: var(--varo-agent-fill);
  border-radius: 12px;
}

.agent-workspace-page__placement {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 8px;
  line-height: 1;
  color: var(--varo-agent-muted);
  background: transparent;
  border: 0;
  border-radius: 8px;
}

.agent-workspace-page__placement[data-active='true'] {
  color: var(--varo-agent-primary);
  background: var(--varo-agent-surface);
  box-shadow: 0 1px 3px rgb(15 23 42 / 10%);
}

.agent-workspace-page__placement--pressed {
  opacity: 0.76;
}

.agent-workspace-page__placement::after {
  border: 0;
}
</style>
