<script setup lang="ts">
import type { AgentThreadVersion } from '@varo-ui/ai'
import type { AgentContextSource, AgentWorkspacePlacement } from '../../components/agent-ui/advanced-types'
import { computed, shallowRef } from 'wevu'
import AgentRagPipeline from '../../components/agent-ui/AgentRagPipeline.vue'
import AgentWorkspace from '../../components/blocks/agent-workspace.vue'
import VButton from '../../components/ui/v-button.vue'
import { useRagDemo } from '../../features/useRagDemo'

const prompt = shallowRef('')
const placement = shallowRef<AgentWorkspacePlacement>('page')
const placementOptions = [
  { id: 'page' as const, label: 'Page' },
  { id: 'docked' as const, label: 'Docked' },
  { id: 'sheet' as const, label: 'Sheet' },
]
const placementChoices = computed(() => placementOptions.map(option => ({
  ...option,
  active: placement.value === option.id,
  label: placement.value === option.id ? `${option.label}（当前）` : option.label,
  variant: placement.value === option.id ? 'solid' as const : 'ghost' as const,
})))
const open = shallowRef(true)
const activity = shallowRef('演示数据：可取消、重播，并通过引用查看对应来源。')
const sources = shallowRef<AgentContextSource[]>([
  { id: 'support', label: '支持队列', description: '14 条注册问题工单', enabled: true, status: 'available' },
  { id: 'replay', label: '会话回放', description: '18 次失败注册流程', enabled: true, status: 'available' },
  { id: 'drive', label: '产品文档', description: '需要重新连接', enabled: false, status: 'unavailable' },
])
const { snapshot: rag, busy: ragBusy, run: runRag, cancel: cancelRag } = useRagDemo(() => sources.value, 'zh')
const versions: AgentThreadVersion[] = [
  { id: 'root', label: '初始分析', summary: '注册失败根因', createdAt: '09:32', pinned: true },
  { id: 'retry-copy', parentId: 'root', label: '保守修复', summary: '只调整重试提示', createdAt: '09:38' },
  { id: 'flow-fix', parentId: 'root', label: '流程修复', summary: '修复签名与幂等', createdAt: '09:41' },
]

function toggleSource(source: AgentContextSource, enabled: boolean) {
  sources.value = sources.value.map(item => item.id === source.id ? { ...item, enabled } : item)
  activity.value = `${source.label}已${enabled ? '加入' : '移出'}上下文。`
}

function setPlacement(next: AgentWorkspacePlacement) {
  placement.value = next
  open.value = true
}

async function submit(value: string) {
  activity.value = `演示问题：${value}`
  prompt.value = ''
  await runRag(value)
}

function closeWorkspace() {
  cancelRag()
  open.value = false
}
</script>

<template>
  <view class="agent-workspace-page box-border min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[var(--varo-ui-bg)] px-4 py-5">
    <view class="box-border mx-auto grid w-full min-w-0 max-w-full gap-4 overflow-hidden">
      <view class="grid gap-2">
        <text class="text-lg font-bold text-[var(--varo-agent-foreground)]">
          Agent Workspace
        </text>
        <text class="text-xs leading-5 text-[var(--varo-agent-muted)]">
          五步 RAG 演示：来源检索、上下文聚合与流式引用联动。
        </text>
      </view>
      <view class="box-border grid w-full min-w-0 max-w-full grid-cols-3 gap-1 rounded-xl bg-[var(--varo-agent-fill)] p-1" role="group" aria-label="Workspace placement">
        <VButton
          v-for="choice in placementChoices"
          :key="choice.id"
          block
          class-name="h-11 min-w-0 px-2 text-xs"
          :aria-pressed="choice.active"
          :variant="choice.variant"
          @click="setPlacement(choice.id)"
        >
          {{ choice.label }}
        </VButton>
      </view>
      <text class="rounded-xl bg-[var(--varo-agent-fill)] px-3 py-2 text-xs text-[var(--varo-agent-text)]">
        {{ activity }}
      </text>
      <AgentWorkspace
        v-model:prompt="prompt"
        class="block w-full min-w-0 max-w-full overflow-hidden"
        active-version-id="flow-fix"
        :busy="ragBusy"
        :context-usage="64"
        :open="open"
        :placement="placement"
        :sources="sources"
        :versions="versions"
        subtitle="演示数据：只读取已授权来源，引用与对应片段保持联动。"
        title="注册失败分析"
        @branch-version="activity = `从版本 ${$event.label || $event.id} 创建分支`"
        @close="closeWorkspace"
        @connect-source="activity = `连接来源：${$event.label}`"
        @pin-version="activity = `固定版本：${$event.label || $event.id}`"
        @select-version="activity = `切换版本：${$event.label || $event.id}`"
        @submit="submit"
        @toggle-source="toggleSource"
      >
        <template #execution>
          <AgentRagPipeline
            class="block w-full min-w-0 max-w-full"
            :answer="rag.answer"
            :elapsed-ms="rag.elapsedMs"
            :query="rag.query"
            :sources="rag.sources"
            :steps="rag.steps"
            @cancel="cancelRag"
            @run="runRag()"
            @select-source="activity = `已选中来源：${$event.title}`"
          />
        </template>
      </AgentWorkspace>
    </view>
  </view>
</template>
