<script setup lang="ts">
import type { AgentContextSource } from '../../components/agent-ui/advanced-types'
import { computed, onUnmounted, shallowRef } from 'wevu'
import AgentRagPipeline from '../../components/agent-ui/AgentRagPipeline.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import { useRagDemo } from '../../features/useRagDemo'

const previewSources: AgentContextSource[] = [
  { id: 'support', label: '客服工单', enabled: true, status: 'available' },
  { id: 'replay', label: '会话回放', enabled: true, status: 'available' },
  { id: 'drive', label: '产品文档', enabled: true, status: 'available' },
]

const selectedSourceId = shallowRef('')
const lastSourceAction = shallowRef('尚未选择来源')
const demo = useRagDemo(() => previewSources, 'zh')

const runningCount = computed(() => demo.snapshot.value.steps.filter(step => step.status === 'running').length)
const completedCount = computed(() => demo.snapshot.value.steps.filter(step => step.status === 'completed').length)
const sourceCount = computed(() => demo.snapshot.value.sources.length)
const citationCount = computed(() => demo.snapshot.value.answer.filter(part => part.type === 'citation').length)
const actionLabel = computed(() => demo.busy.value ? '停止检索' : '运行 RAG 演示')
const ragDiagnostic = computed(() =>
  `busy=${String(demo.busy.value)};running=${runningCount.value};completed=${completedCount.value};sources=${sourceCount.value};citations=${citationCount.value};selected=${selectedSourceId.value || 'none'}`,
)

function toggleRag() {
  if (demo.busy.value) {
    demo.cancel()
    return
  }
  selectedSourceId.value = ''
  lastSourceAction.value = '开始本地 RAG 演示'
  void demo.run()
}

function recordSelectedSource(source: { id: string, title: string }) {
  selectedSourceId.value = source.id
  lastSourceAction.value = `选中来源：${source.title}`
}

onUnmounted(() => {
  demo.cancel()
})
</script>

<template>
  <view class="box-border min-h-screen bg-[var(--varo-ui-bg)] px-3 py-4 text-[var(--varo-ui-text)]">
    <view class="mb-3 grid gap-1 rounded-2xl bg-slate-950 p-4 text-white">
      <text class="text-lg font-black">
        Wevu 原生 RAG 预览
      </text>
      <text class="text-xs leading-5 text-slate-300">
        AgentRagPipeline 只投影本地快照：五阶段进度、来源卡片和带引用的回答。这里不调用模型或检索服务。
      </text>
    </view>

    <VCard variant="outline">
      <template #title>
        AgentRagPipeline 可观察流程
      </template>
      <template #description>
        运行后可看到 query → generate；点引用会高亮对应来源。停止会保留当前查询。
      </template>

      <view class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
        <AgentRagPipeline
          :query="demo.snapshot.value.query"
          :steps="demo.snapshot.value.steps"
          :sources="demo.snapshot.value.sources"
          :answer="demo.snapshot.value.answer"
          :elapsed-ms="demo.snapshot.value.elapsedMs"
          reduced-motion
          @run="toggleRag"
          @cancel="toggleRag"
          @select-source="recordSelectedSource"
        />

        <view
          class="grid gap-1 rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs"
          data-preview-field="rag-state"
          :data-preview-value="ragDiagnostic"
        >
          <text data-preview-field="rag-query">
            查询：{{ demo.snapshot.value.query }}
          </text>
          <text data-preview-field="rag-busy">
            运行中：{{ demo.busy.value ? 'yes' : 'no' }}
          </text>
          <text data-preview-field="rag-progress">
            阶段：{{ completedCount }}/5 完成，{{ runningCount }} 运行
          </text>
          <text data-preview-field="rag-sources">
            来源：{{ sourceCount }}，引用：{{ citationCount }}
          </text>
          <text data-preview-field="rag-selected">
            当前来源：{{ selectedSourceId || '尚未选择' }}
          </text>
          <text data-preview-field="rag-last-action">
            {{ lastSourceAction }}
          </text>
        </view>

        <VButton block @click="toggleRag">
          {{ actionLabel }}
        </VButton>
      </view>
    </VCard>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Wevu RAG 预览",
  "usingComponents": {}
}
</json>
