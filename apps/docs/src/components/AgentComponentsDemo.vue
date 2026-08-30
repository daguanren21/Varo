<script setup lang="ts">
import { nextTick, onBeforeUnmount, shallowRef, useTemplateRef, watch } from 'vue'
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

const transcript = useTemplateRef<HTMLElement>('transcript')
const followsLatest = shallowRef(true)
let scrollFrame: number | undefined

function transcriptAtLiveEdge() {
  const element = transcript.value
  return !element || element.scrollHeight - element.scrollTop - element.clientHeight <= 64
}

function syncTranscriptLiveEdge() {
  followsLatest.value = transcriptAtLiveEdge()
}

function followLatest(force = false) {
  if (!force && !followsLatest.value) {
    return
  }
  if (scrollFrame !== undefined) {
    cancelAnimationFrame(scrollFrame)
  }
  void nextTick(() => {
    scrollFrame = requestAnimationFrame(() => {
      const element = transcript.value
      if (!element) {
        return
      }
      element.scrollTop = element.scrollHeight
      followsLatest.value = true
      scrollFrame = undefined
    })
  })
}

function submitPrompt(value: string) {
  followsLatest.value = true
  run(value)
  followLatest(true)
}

watch(
  [
    () => messages.value.at(-1)?.content,
    () => snapshot.value.message?.visible,
    () => snapshot.value.status,
  ],
  () => followLatest(),
  { flush: 'post' },
)

onBeforeUnmount(() => {
  if (scrollFrame !== undefined) {
    cancelAnimationFrame(scrollFrame)
  }
})

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

        <div ref="transcript" class="ai-docs-demo__transcript" @scroll.passive="syncTranscriptLiveEdge">
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
          <button
            v-if="!followsLatest"
            class="ai-docs-demo__follow"
            type="button"
            @click="followLatest(true)"
          >
            {{ t('跳到最新', 'Jump to latest') }}
          </button>
        </div>

        <footer>
          <AgentComposer
            v-model="prompt"
            :busy="busy"
            :placeholder="t('向 Agent 提问…', 'Ask the Agent…')"
            :suggestions="[t('分析双端能力', 'Analyze both targets'), t('生成发布计划', 'Generate a release plan')]"
            @submit="submitPrompt"
          />
        </footer>
      </div>

      <aside class="ai-docs-demo__specimens">
        <header class="ai-docs-demo__specimens-head">
          <span>
            <small>CONTEXT RAIL</small>
            <strong>{{ t('运行上下文', 'Run context') }}</strong>
          </span>
          <i>LIVE</i>
        </header>
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
  padding: 0;
  margin: 0;
  font-size: clamp(20px, 3vw, 30px);
  line-height: 1.15;
  color: #172033;
  letter-spacing: -0.035em;
  text-wrap: balance;
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
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.9fr);
  gap: 16px;
  align-items: start;
}

.ai-docs-demo__workspace > *,
.ai-docs-demo__specimens > * {
  min-width: 0;
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
  position: relative;
  display: grid;
  gap: 12px;
  align-content: start;
  height: clamp(420px, 62vh, 560px);
  padding: 16px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
  scrollbar-color: #94a3b8 transparent;
  scrollbar-width: thin;
}

.ai-docs-demo__follow {
  position: sticky;
  bottom: 0;
  z-index: 3;
  justify-self: center;
  min-height: 36px;
  padding: 0 14px;
  font-size: 11px;
  font-weight: 800;
  color: #0f766e;
  cursor: pointer;
  background: rgb(255 255 255 / 94%);
  border: 1px solid #99f6e4;
  border-radius: 999px;
  box-shadow: 0 8px 24px rgb(15 23 42 / 14%);
  backdrop-filter: blur(10px);
}

.ai-docs-demo__chat > footer {
  padding: 12px;
  background: #fff;
  border-top: 1px solid #e2e8f0;
}

.ai-docs-demo__specimens {
  position: sticky;
  top: 88px;
  display: grid;
  gap: 12px;
  max-height: calc(100vh - 112px);
  padding: 12px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  scrollbar-color: #94a3b8 transparent;
  scrollbar-width: thin;
  background: #eef2f6;
  border: 1px solid #dbe4ee;
  border-radius: 24px;
  box-shadow: 0 18px 44px rgb(15 23 42 / 8%);
}

.ai-docs-demo__specimens-head {
  display: flex;
  gap: 12px;
  align-items: end;
  justify-content: space-between;
  padding: 2px 2px 4px;
}

.ai-docs-demo__specimens-head span {
  display: grid;
  gap: 1px;
}

.ai-docs-demo__specimens-head small {
  font-size: 9px;
  font-weight: 900;
  color: #0f766e;
  letter-spacing: 0.14em;
}

.ai-docs-demo__specimens-head strong {
  font-size: 13px;
  color: #172033;
}

.ai-docs-demo__specimens-head i {
  padding: 4px 8px;
  font-size: 9px;
  font-style: normal;
  font-weight: 900;
  color: #0f766e;
  letter-spacing: 0.08em;
  background: #ccfbf1;
  border-radius: 999px;
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

.ai-docs-demo :deep(button:focus-visible),
.ai-docs-demo :deep(a:focus-visible) {
  outline: 2px solid #0f766e;
  outline-offset: 2px;
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


/* Perceptual workspace theme */
.ai-docs-demo {
  color: var(--varo-foreground);
}

.ai-docs-demo__hero {
  color: var(--varo-foreground);
  background: var(--varo-surface);
  border-color: var(--varo-border);
}

.ai-docs-demo__hero p,
.ai-docs-demo__hero output[data-status='streaming'],
.ai-docs-demo__hero output[data-status='waiting'] {
  color: var(--varo-accent);
}

.ai-docs-demo__hero h2 {
  color: var(--varo-foreground);
}

.ai-docs-demo__hero span {
  color: var(--varo-muted);
}

.ai-docs-demo__hero output {
  color: var(--varo-muted);
  background: var(--varo-surface-strong);
  border-color: var(--varo-border);
}

.ai-docs-demo__hero output[data-status='streaming'],
.ai-docs-demo__hero output[data-status='waiting'] {
  background: var(--varo-accent-soft);
  border-color: var(--varo-accent-border);
}

.ai-docs-demo__hero output[data-status='completed'] {
  color: var(--varo-color-success);
  background: color-mix(in srgb, var(--varo-color-success) 9%, var(--varo-surface));
  border-color: color-mix(in srgb, var(--varo-color-success) 42%, var(--varo-border));
}

.ai-docs-demo__chat,
.ai-docs-demo__specimens,
.ai-docs-demo__ledger {
  color: var(--varo-foreground);
  background: var(--varo-surface);
  border-color: var(--varo-border);
  box-shadow: var(--varo-shadow-sm);
}

.ai-docs-demo__chat-head,
.ai-docs-demo__chat > footer,
.ai-docs-demo__specimens-head,
.ai-docs-demo__ledger header {
  color: var(--varo-foreground);
  background: var(--varo-surface);
  border-color: var(--varo-border);
}

.ai-docs-demo__chat-head i {
  color: var(--varo-primary-foreground);
  background: var(--varo-primary);
}

.ai-docs-demo__chat-head small,
.ai-docs-demo__specimens-head strong {
  color: var(--varo-muted);
}

.ai-docs-demo__transcript,
.ai-docs-demo__specimens {
  background: var(--varo-surface-strong);
}

.ai-docs-demo__specimens-head small,
.ai-docs-demo__ledger header span {
  color: var(--varo-accent);
}

.ai-docs-demo__specimens-head i {
  color: var(--varo-accent);
  background: var(--varo-accent-soft);
  border-color: var(--varo-accent-border);
}

.ai-docs-demo__ledger > div span {
  color: var(--varo-muted);
  background: var(--varo-surface-strong);
  border-color: var(--varo-border);
}

.ai-docs-demo :deep(button) {
  min-width: 44px;
  min-height: 44px;
}

.ai-docs-demo :deep(input),
.ai-docs-demo :deep(textarea),
.ai-docs-demo :deep(select) {
  min-height: 44px;
}

.ai-docs-demo :deep(button:focus-visible),
.ai-docs-demo :deep(a:focus-visible) {
  outline-color: var(--varo-ring);
}

.ai-docs-demo :deep(.agent-markdown__table-scroll),
.ai-docs-demo :deep(.agent-markdown__table),
.ai-docs-demo :deep(.agent-markdown__table th),
.ai-docs-demo :deep(.agent-markdown__table td) {
  color: var(--varo-foreground);
  background: var(--varo-surface);
  border-color: var(--varo-border);
}

.ai-docs-demo :deep(.agent-markdown__table th) {
  background: var(--varo-surface-strong);
}
@media (max-width: 760px) {
  .ai-docs-demo {
    gap: 16px;
    margin-bottom: 32px;
  }

  .ai-docs-demo__hero {
    flex-direction: column;
    gap: 16px;
    align-items: start;
    padding: 18px;
    border-radius: 20px;
  }

  .ai-docs-demo__workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .ai-docs-demo__chat,
  .ai-docs-demo__specimens {
    border-radius: 20px;
  }

  .ai-docs-demo__specimens {
    position: static;
    max-height: none;
    padding: 10px;
  }

  .ai-docs-demo__transcript {
    height: min(520px, 64vh);
    min-height: 380px;
    padding: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-docs-demo__transcript {
    scroll-behavior: auto;
  }
}
</style>
