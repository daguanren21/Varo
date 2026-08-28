<script setup lang="ts">
import { useAgentDocsDemo } from '../composables/useAgentDocsDemo'
import {
  AgentArtifact,
  AgentAttachmentList,
  AgentComposer,
  AgentConversation,
  AgentEventRenderer,
  AgentRecommendation,
  AgentResponseActions,
  AgentSourceList,
  AgentTaskList,
} from './agent-ui'

type Locale = 'en' | 'zh'

const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'zh' })
const { approve, busy, messages, prompt, reject, retry, run, snapshot } = useAgentDocsDemo()

const capabilities = [
  'AgentLoading',
  'AgentThinking',
  'AgentMarkdown',
  'AgentStream',
  'AgentMessage',
  'AgentConversation',
  'AgentMessageScroller',
  'AgentToolChip',
  'AgentToolResult',
  'AgentTaskList',
  'AgentActivity',
  'AgentApproval',
  'AgentToolApproval',
  'AgentRecommendation',
  'AgentEventRenderer',
  'AgentRadioGroup',
  'AgentPromptSuggestions',
  'AgentComposer',
  'AgentResponseActions',
  'AgentSelectionActions',
  'AgentCommandSearch',
  'AgentArtifact',
  'AgentAttachmentList',
  'AgentSourceList',
  'AgentCitations',
  'AgentContextCard',
  'AgentCodeBlock',
  'AgentFileDiff',
  'AgentImageGeneration',
  'AgentSidebar',
  'AgentInsightCard',
  'AgentDiffTable',
  'AgentRecordsTable',
  'AgentFilterTable',
  'AgentFlowchart',
  'AgentFineTune',
  'AgentChat Block',
]
const tasks = [
  { id: 'protocol', title: '统一事件协议', status: 'completed' as const, progress: 100 },
  { id: 'renderer', title: '双端增量渲染', status: 'completed' as const, progress: 100 },
  { id: 'approval', title: '人工审批门禁', status: 'running' as const, progress: 72 },
]
const artifact = {
  content: `const controller = createAgentStreamController()\nawait controller.connect(events)`,
  id: 'controller',
  kind: 'code' as const,
  language: 'ts',
  title: '@varo-ui/ai',
}
const sources = [
  { domain: 'github.com/Simon-He95', id: 'markstream', title: 'Markstream Core', url: 'https://github.com/Simon-He95/markstream-vue' },
  { domain: 'ui.shadcn.com', id: 'shadcn', title: 'shadcn Registry', url: 'https://ui.shadcn.com/docs/registry' },
]
const attachments = [
  { id: 'schema', mimeType: 'application/json', name: 'agent-events.schema.json', size: '4.2 KB' },
  { id: 'preview', mimeType: 'image/png', name: 'weapp-preview.png', size: '86 KB' },
]

function t(zh: string, en: string) {
  return props.locale === 'zh' ? zh : en
}
</script>

<template>
  <section class="ai-docs-demo" aria-label="Varo Agent UI live demo">
    <header class="ai-docs-demo__hero">
      <div>
        <p>VARO AGENT UI</p>
        <h2>{{ t('真实增量事件流，不是静态截图', 'A real incremental event stream, not a static screenshot') }}</h2>
        <span>{{ t('H5 使用 Markstream RAF；小程序使用定时帧调度和相同 Markdown AST。', 'H5 uses Markstream RAF; mini programs use timed frames with the same Markdown AST.') }}</span>
      </div>
      <output :data-status="snapshot.status">{{ snapshot.status }}</output>
    </header>

    <div class="ai-docs-demo__workspace">
      <div class="ai-docs-demo__chat">
        <header class="ai-docs-demo__chat-head">
          <i aria-hidden="true">V</i>
          <span>
            <strong>Varo Agent</strong>
            <small>{{ t('37 个双端 AI UI surface 已连接', '37 dual-target AI UI surfaces connected') }}</small>
          </span>
        </header>

        <div class="ai-docs-demo__transcript">
          <AgentConversation :messages="messages" />
          <AgentEventRenderer
            v-if="snapshot.status !== 'idle'"
            :snapshot="snapshot"
            @approve="approve"
            @reject="reject"
            @retry="retry"
          >
            <template #actions>
              <AgentResponseActions :content="snapshot.message?.source" @retry="retry" />
            </template>
          </AgentEventRenderer>
        </div>

        <footer>
          <AgentComposer
            v-model="prompt"
            :busy="busy"
            :placeholder="t('向 Agent 提问…', 'Ask the Agent…')"
            :suggestions="[t('分析双端能力', 'Analyze both targets'), t('生成发布计划', 'Generate a release plan')]"
            @submit="run"
          />
        </footer>
      </div>

      <aside class="ai-docs-demo__specimens">
        <AgentRecommendation
          :title="t('推荐统一事件协议', 'Use the shared event protocol')"
          :description="t('业务只负责事件来源，组件负责状态投影。', 'The product owns event sources; components own state projection.')"
          :confidence="96"
        />
        <AgentTaskList :tasks="tasks" :title="t('实现进度', 'Implementation progress')" />
        <AgentArtifact :artifact="artifact" />
        <AgentSourceList :sources="sources" :title="t('参考来源', 'Sources')" />
        <AgentAttachmentList :attachments="attachments" />
      </aside>
    </div>

    <div class="ai-docs-demo__ledger">
      <header>
        <strong>{{ t('组件能力清单', 'Capability ledger') }}</strong>
        <span>37 / 37</span>
      </header>
      <div>
        <span v-for="capability in capabilities" :key="capability">{{ capability }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ai-docs-demo {
  display: grid;
  gap: 20px;
  margin: 24px 0 40px;
  color: #172033;
}

.ai-docs-demo__hero {
  display: flex;
  gap: 24px;
  align-items: end;
  justify-content: space-between;
  padding: 22px;
  background:
    radial-gradient(circle at 88% 15%, rgb(45 212 191 / 20%), transparent 28%),
    linear-gradient(145deg, #f8fafc, #ecfdf5);
  border: 1px solid rgb(15 118 110 / 18%);
  border-radius: 24px;
}

.ai-docs-demo__hero p {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 900;
  color: #0f766e;
  letter-spacing: 0.16em;
}

.ai-docs-demo__hero h2 {
  margin: 0;
  font-size: clamp(20px, 3vw, 30px);
  letter-spacing: -0.035em;
  border: 0;
}

.ai-docs-demo__hero span {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
}

.ai-docs-demo__hero output {
  flex: none;
  min-width: 94px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 900;
  color: #64748b;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
}

.ai-docs-demo__hero output[data-status='streaming'],
.ai-docs-demo__hero output[data-status='waiting'] {
  color: #0f766e;
  background: #f0fdfa;
  border-color: #99f6e4;
}

.ai-docs-demo__hero output[data-status='completed'] {
  color: #15803d;
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.ai-docs-demo__workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(250px, 0.72fr);
  gap: 16px;
  align-items: start;
}

.ai-docs-demo__chat {
  display: grid;
  min-width: 0;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #dbe4ee;
  border-radius: 24px;
  box-shadow: 0 22px 60px rgb(15 23 42 / 10%);
}

.ai-docs-demo__chat-head {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 64px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.ai-docs-demo__chat-head i {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  font-style: normal;
  font-weight: 900;
  color: #fff;
  background: #0f766e;
  border-radius: 14px;
}

.ai-docs-demo__chat-head span {
  display: grid;
}

.ai-docs-demo__chat-head strong {
  font-size: 14px;
}

.ai-docs-demo__chat-head small {
  font-size: 11px;
  color: #94a3b8;
}

.ai-docs-demo__transcript {
  display: grid;
  gap: 12px;
  align-content: start;
  min-height: 480px;
  max-height: 660px;
  padding: 16px;
  overflow-y: auto;
}

.ai-docs-demo__chat > footer {
  padding: 12px;
  background: #fff;
  border-top: 1px solid #e2e8f0;
}

.ai-docs-demo__specimens {
  display: grid;
  gap: 12px;
}

.ai-docs-demo__ledger {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

.ai-docs-demo__ledger header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid #f1f5f9;
}

.ai-docs-demo__ledger header span {
  font-size: 12px;
  font-weight: 800;
  color: #0f766e;
}

.ai-docs-demo__ledger > div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
}

.ai-docs-demo__ledger > div span {
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #dbe4ee;
  border-radius: 999px;
}

.ai-docs-demo :deep(.agent-markdown__table-scroll) {
  overflow-x: auto;
  background: #fff;
  border: 1px solid #dbe4ee;
  border-radius: 14px;
}

.ai-docs-demo :deep(.agent-markdown__table) {
  width: 100%;
  color: #334155;
  background: #fff;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.ai-docs-demo :deep(.agent-markdown__table th),
.ai-docs-demo :deep(.agent-markdown__table td) {
  color: #334155;
  background: #fff;
  border-color: #dbe4ee;
}

.ai-docs-demo :deep(.agent-markdown__table th) {
  color: #172033;
  background: #f1f5f9;
}

@media (max-width: 760px) {
  .ai-docs-demo__hero {
    flex-direction: column;
    align-items: start;
  }

  .ai-docs-demo__workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .ai-docs-demo__transcript {
    min-height: 420px;
  }
}
</style>
