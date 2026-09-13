<script setup lang="ts">
import { nextTick, onBeforeUnmount, shallowRef, useTemplateRef, watch } from 'vue'
import { useAgentDocsDemo } from '../composables/useAgentDocsDemo'
import { useRagPipelineDemo } from '../composables/useRagPipelineDemo'
import {
  AgentComposer,
  AgentConversation,
  AgentEventRenderer,
  AgentRagPipeline,
  AgentResponseActions,
} from './agent-ui'

type Locale = 'en' | 'zh'

const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'zh' })
const { approve, busy, messages, prompt, reject, retry, run, snapshot } = useAgentDocsDemo()
const { snapshot: ragSnapshot, run: runRag, cancel: cancelRag } = useRagPipelineDemo(props.locale)

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

function t(zh: string, en: string) {
  return props.locale === 'zh' ? zh : en
}
</script>

<template>
  <section class="ai-docs-demo" :aria-label="t('Varo Agent UI 实时演示', 'Varo Agent UI live demo')">
    <section class="ai-docs-demo__mode" :aria-label="t('Chat 模式', 'Chat mode')">
      <header class="ai-docs-demo__mode-head">
        <span>
          <small>CHAT</small>
          <h3>{{ t('Chat 模式', 'Chat') }}</h3>
        </span>
        <output :data-status="snapshot.status">{{ snapshot.status }}</output>
      </header>

      <div class="ai-docs-demo__chat">
        <header class="ai-docs-demo__chat-head">
          <i aria-hidden="true">V</i>
          <strong>Varo Agent</strong>
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
    </section>

    <section class="ai-docs-demo__mode" :aria-label="t('RAG 模式', 'RAG mode')">
      <header class="ai-docs-demo__mode-head">
        <span>
          <small>RAG</small>
          <h3>{{ t('RAG 模式', 'RAG') }}</h3>
        </span>
        <i>LIVE</i>
      </header>

      <div class="ai-docs-demo__rag">
        <AgentRagPipeline
          :query="ragSnapshot.query"
          :steps="ragSnapshot.steps"
          :sources="ragSnapshot.sources"
          :answer="ragSnapshot.answer"
          :elapsed-ms="ragSnapshot.elapsedMs"
          reduced-motion
          @run="runRag"
          @cancel="cancelRag"
        />
      </div>
    </section>
  </section>
</template>

<style scoped>
.ai-docs-demo {
  --ai-demo-surface: var(--varo-demo-surface);
  --ai-demo-card: var(--varo-surface);
  --ai-demo-border: var(--varo-demo-border);
  --ai-demo-text: var(--varo-foreground);
  --ai-demo-muted: var(--varo-muted);
  --ai-demo-accent: var(--varo-primary);
  --ai-demo-accent-soft: var(--varo-primary-soft);
  --ai-demo-success: var(--varo-success);
  --ai-demo-success-soft: var(--varo-success-soft);
  --ai-demo-shadow: var(--varo-demo-shadow);

  display: grid;
  gap: 28px;
  margin: 24px 0 40px;
  color: var(--ai-demo-text);
}

.ai-docs-demo__mode {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.ai-docs-demo__mode-head {
  display: flex;
  gap: 16px;
  align-items: end;
  justify-content: space-between;
  padding-inline: 4px;
}

.ai-docs-demo__mode-head span {
  display: grid;
  gap: 2px;
}

.ai-docs-demo__mode-head small {
  font-size: 10px;
  font-weight: 900;
  color: var(--ai-demo-accent);
  letter-spacing: 0.14em;
}

.ai-docs-demo__mode-head h3 {
  padding: 0;
  margin: 0;
  font-size: 20px;
  color: var(--ai-demo-text);
  border: 0;
}

.ai-docs-demo__mode-head output,
.ai-docs-demo__mode-head > i {
  flex: none;
  min-width: 72px;
  padding: 6px 10px;
  font-size: 10px;
  font-style: normal;
  font-weight: 900;
  color: var(--ai-demo-muted);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: var(--ai-demo-card);
  border: 1px solid var(--ai-demo-border);
  border-radius: 999px;
}

.ai-docs-demo__mode-head output[data-status='streaming'],
.ai-docs-demo__mode-head output[data-status='waiting'],
.ai-docs-demo__mode-head > i {
  color: var(--ai-demo-accent);
  background: var(--ai-demo-accent-soft);
  border-color: color-mix(in srgb, var(--ai-demo-accent) 48%, var(--ai-demo-border));
}

.ai-docs-demo__mode-head output[data-status='completed'] {
  color: var(--ai-demo-success);
  background: var(--ai-demo-success-soft);
  border-color: color-mix(in srgb, var(--ai-demo-success) 48%, var(--ai-demo-border));
}

.ai-docs-demo__chat {
  display: grid;
  min-width: 0;
  overflow: hidden;
  background: var(--ai-demo-surface);
  border: 1px solid var(--ai-demo-border);
  border-radius: 24px;
  box-shadow: var(--ai-demo-shadow);
}

.ai-docs-demo__chat-head {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 64px;
  padding: 0 16px;
  background: var(--ai-demo-card);
  border-bottom: 1px solid var(--ai-demo-border);
}

.ai-docs-demo__chat-head i {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  font-style: normal;
  font-weight: 900;
  color: var(--varo-primary-foreground);
  background: var(--ai-demo-accent);
  border-radius: 14px;
}

.ai-docs-demo__chat-head strong {
  font-size: 14px;
}

.ai-docs-demo__transcript {
  position: relative;
  display: grid;
  gap: 12px;
  align-content: start;
  height: clamp(420px, 58vh, 600px);
  padding: 18px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
  scrollbar-color: var(--ai-demo-muted) transparent;
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
  color: var(--ai-demo-accent);
  cursor: pointer;
  background: color-mix(in srgb, var(--ai-demo-card) 94%, transparent);
  border: 1px solid color-mix(in srgb, var(--ai-demo-accent) 48%, var(--ai-demo-border));
  border-radius: 999px;
  box-shadow: var(--ai-demo-shadow);
  backdrop-filter: blur(10px);
}

.ai-docs-demo__chat > footer {
  padding: 12px;
  background: var(--ai-demo-card);
  border-top: 1px solid var(--ai-demo-border);
}

.ai-docs-demo__rag {
  min-width: 0;
  padding: 16px;
  background: var(--ai-demo-surface);
  border: 1px solid var(--ai-demo-border);
  border-radius: 24px;
  box-shadow: var(--ai-demo-shadow);
}

.ai-docs-demo :deep(button:focus-visible),
.ai-docs-demo :deep(a:focus-visible) {
  outline: 2px solid var(--ai-demo-accent);
  outline-offset: 2px;
}

.ai-docs-demo :deep(.agent-markdown__table-scroll) {
  overflow-x: auto;
  background: var(--ai-demo-card);
  border: 1px solid var(--ai-demo-border);
  border-radius: 14px;
}

.ai-docs-demo :deep(.agent-markdown__table) {
  width: 100%;
  color: var(--ai-demo-text);
  background: var(--ai-demo-card);
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.ai-docs-demo :deep(.agent-markdown__table th),
.ai-docs-demo :deep(.agent-markdown__table td) {
  color: var(--ai-demo-text);
  background: var(--ai-demo-card);
  border-color: var(--ai-demo-border);
}

.ai-docs-demo :deep(.agent-markdown__table th) {
  background: var(--ai-demo-surface);
}

@media (max-width: 760px) {
  .ai-docs-demo {
    gap: 24px;
    margin-bottom: 32px;
  }

  .ai-docs-demo__chat,
  .ai-docs-demo__rag {
    border-radius: 20px;
  }

  .ai-docs-demo__rag {
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
