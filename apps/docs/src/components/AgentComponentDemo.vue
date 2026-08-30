<script setup lang="ts">
import type { AgentStreamSnapshot } from '@varo-ui/ai'
import { computed, shallowRef } from 'vue'
import { agentDemoCatalog } from '../agent-component-catalog'
import {
  AgentActivity,
  AgentApproval,
  AgentArtifact,
  AgentAttachmentList,
  AgentCitations,
  AgentCodeBlock,
  AgentCommandSearch,
  AgentComposer,
  AgentContextCard,
  AgentConversation,
  AgentDiffTable,
  AgentEventRenderer,
  AgentFileDiff,
  AgentFilterTable,
  AgentFineTune,
  AgentFlowchart,
  AgentImageGeneration,
  AgentInsightCard,
  AgentLoading,
  AgentMarkdown,
  AgentMessage,
  AgentMessageScroller,
  AgentPromptSuggestions,
  AgentRadioGroup,
  AgentRecommendation,
  AgentRecordsTable,
  AgentResponseActions,
  AgentSelectionActions,
  AgentSidebar,
  AgentSourceList,
  AgentStream,
  AgentTaskList,
  AgentThinking,
  AgentToolApproval,
  AgentToolChip,
  AgentToolResult,
} from './agent-ui'
import AgentChat from './blocks/agent-chat.vue'

type Locale = 'en' | 'zh'

const props = withDefaults(defineProps<{ component: string, locale?: Locale }>(), { locale: 'zh' })
const demoTab = shallowRef<'code' | 'preview'>('preview')
const demoDefinition = computed(() => agentDemoCatalog[props.component])
const diffLabels = computed(() => props.locale === 'zh'
  ? {
      accept: '接受变更',
      changed: '行变更',
      collapse: '收起文件',
      display: '差异视图',
      empty: '没有变更',
      expand: '展开未修改行',
      line: '第',
      lineNumbers: '行号',
      new: '新版本',
      old: '旧版本',
      reject: '拒绝',
      split: '并排',
      unchanged: '行未修改',
      unified: '单栏',
      wrap: '换行',
    }
  : {})
const radioValue = shallowRef('balanced')
const approvalValue = shallowRef('verify')
const prompt = shallowRef('')
const feedback = shallowRef('')
const sidebarActive = shallowRef('release')
const sidebarCollapsed = shallowRef(false)
const insightCurrent = shallowRef(0)
const tableFilter = shallowRef('all')
const searchQuery = shallowRef('')
const fineTuneControls = shallowRef([
  { label: 'Width', min: 240, max: 640, step: 8, type: 'number' as const, value: 420 },
  { label: 'Radius', min: 0, max: 32, step: 1, type: 'number' as const, value: 18 },
  { label: 'Tone', type: 'select' as const, value: 'neutral', values: [{ label: 'Neutral', value: 'neutral' }, { label: 'Expressive', value: 'expressive' }] },
])

const messages = [
  { content: '请检查这次发布是否满足双端要求。', id: 'user', role: 'user' as const, timestamp: '10:24' },
  { content: '已完成检查，H5 与小程序均通过。', id: 'assistant', role: 'assistant' as const, timestamp: '10:25' },
]
const reasoningSteps = [
  { id: 'intent', title: '理解请求', detail: '识别为发布前检查', status: 'completed' as const, duration: '0.2s' },
  { id: 'registry', title: '读取 Registry', detail: '验证 37 个 Agent UI surface', status: 'completed' as const, duration: '0.4s' },
  { id: 'build', title: '检查构建', detail: '双端产物已生成', status: 'running' as const },
]
const tools = [
  { id: 'registry', name: 'registry.inspect', status: 'completed' as const, summary: '37 surfaces' },
  { id: 'build', name: 'workspace.build', status: 'running' as const, summary: 'weapp-vite' },
  { id: 'publish', name: 'npm.publish', status: 'waiting' as const, summary: '等待审批' },
]
const tasks = [
  { id: 'typecheck', title: '类型检查', status: 'completed' as const, progress: 100, meta: '16/16' },
  { id: 'test', title: '行为测试', status: 'completed' as const, progress: 100, meta: 'passed' },
  { id: 'build', title: '双端构建', status: 'running' as const, progress: 72, meta: '2 targets' },
]
const choices = [
  { label: '仅验证', value: 'verify', description: '不产生外部副作用' },
  { label: '验证并发布', value: 'publish', description: '通过后进入发布流程' },
]
const artifact = {
  content: `const controller = createAgentStreamController()\nawait controller.connect(events)`,
  id: 'agent-core',
  kind: 'code' as const,
  language: 'ts',
  title: '@varo-ui/ai',
}
const sources = [
  { domain: 'github.com/Simon-He95', id: 'markstream', title: 'Markstream Core', url: 'https://github.com/Simon-He95/markstream-vue' },
  { domain: 'beui.dev', id: 'beui', title: 'beUI Agent Components', url: 'https://beui.dev/components/agents/message-bubble' },
]
const attachments = [
  { id: 'schema', mimeType: 'application/json', name: 'agent-events.schema.json', size: '4.2 KB' },
  { id: 'preview', mimeType: 'image/png', name: 'weapp-preview.png', size: '86 KB' },
]
const eventSnapshot: AgentStreamSnapshot = {
  approval: { choices, description: '发布属于外部副作用。', id: 'approval', status: 'waiting', title: '确认发布动作' },
  data: [],
  eventCount: 12,
  message: { final: false, id: 'response', role: 'assistant', source: '## 发布检查\n\n双端组件已经通过。', visible: '## 发布检查\n\n双端组件已经通过。' },
  reasoning: [{ content: '已读取组件清单', id: 'reason', status: 'completed', title: '检查 Registry' }],
  status: 'waiting',
  tools: [{ id: 'tool', name: 'registry.inspect', status: 'completed', summary: '37 surfaces' }],
}
const code = `const controller = createAgentStreamController({\n  text: { targetLatencyMs: 620 }\n})\n\nawait controller.connect(events)`
const markdownContent = `## 安全 Markdown

支持 **strong**、表格、列表和代码块。

| Target | Status |
| --- | --- |
| Weapp | Ready |`
const streamContent = `## 流式回答

内容正在增量到达，组件保持稳定布局。`
const toolResultOutput = `Test Files 7 passed
Tests 38 passed`
const diffLines = [
  { content: '@@ -16,5 +16,6 @@ createAgentStream', id: 'hunk-main', type: 'hunk' as const },
  { content: 'export function createAgentStream(target: Target) {', newNumber: 16, oldNumber: 16, type: 'context' as const },
  { content: '  const status = shallowRef<\'idle\' | \'done\'>(\'idle\')', id: 'status-old', oldNumber: 17, type: 'remove' as const },
  { content: '  const status = shallowRef<AgentStreamStatus>(\'streaming\')', id: 'status-new', newNumber: 17, type: 'add' as const },
  { content: '  const scheduler = target === \'weapp\' ? \'time-slice\' : \'raf\'', id: 'scheduler', newNumber: 18, type: 'add' as const },
  { content: '  return connect({ scheduler, status })', newNumber: 19, oldNumber: 18, type: 'context' as const },
  { collapsedLines: 18, content: '@@ More unchanged context', id: 'hunk-rest', type: 'hunk' as const },
]
const citations = [
  { description: 'Framework-neutral streaming core', domain: 'github.com', id: 'markstream', title: 'Markstream Core', url: 'https://github.com/Simon-He95/markstream-vue' },
  { description: 'Animated agent component catalog', domain: 'beui.dev', id: 'beui', title: 'beUI', url: 'https://beui.dev/' },
]
const activity = [
  { detail: '识别发布检查意图', duration: '0.2s', id: 'reason', kind: 'reasoning' as const, status: 'completed' as const, title: 'Reasoning' },
  { detail: '找到 37 个 Agent UI surface', duration: '0.4s', id: 'search', kind: 'search' as const, status: 'completed' as const, title: 'Registry search' },
  { detail: '正在构建 weapp-vite', id: 'tool', kind: 'tool' as const, status: 'running' as const, title: 'Build tool' },
]
const sidebarGroups = [
  { id: 'workspace', label: 'Workspace', items: [{ id: 'release', label: 'Release agent', meta: 'Active', badge: 2 }, { id: 'research', label: 'Research', meta: 'Yesterday' }] },
  { id: 'saved', label: 'Saved', items: [{ id: 'components', label: 'Agent components', meta: '37 surfaces' }] },
]
const contextChunks = [
  { content: 'Cold-chain certification must be verified before a new supplier can be approved.', id: 'policy', label: 'Supplier policy', source: 'Onboarding SOP.pdf', sourceType: 'PDF' },
  { content: 'H5 and weapp-vite builds both completed successfully.', id: 'build', label: 'Build report', source: 'CI report.json', sourceType: 'JSON' },
]
const insights = [
  { action: 'Rebalance', description: '小程序首屏包体比上次降低 6%。', id: 'bundle', label: 'Bundle insight', tone: 'success' as const, value: '−6%' },
  { action: 'Inspect', description: '两个工具调用仍在等待用户审批。', id: 'approval', label: 'Workflow insight', tone: 'warning' as const, value: '2' },
]
const columns = [
  { key: 'name', label: 'Component', sortable: true },
  { key: 'target', label: 'Target' },
  { key: 'status', label: 'Status', sortable: true },
]
const records = [
  { id: 'composer', name: 'AgentComposer', status: 'completed', target: 'H5 / Weapp' },
  { id: 'diff', name: 'AgentFileDiff', status: 'running', target: 'H5 / Weapp' },
  { id: 'sidebar', name: 'AgentSidebar', status: 'waiting', target: 'H5 / Weapp' },
]
const filters = [
  { count: 3, label: 'All', value: 'all' },
  { count: 1, label: 'Running', value: 'running' },
  { count: 1, label: 'Completed', value: 'completed' },
]
const searchItems = [
  { description: '运行全仓发布检查', group: 'Actions', id: 'release', label: 'Generate release plan', shortcut: '⌘R' },
  { description: '查看 Agent UI 覆盖', group: 'Docs', id: 'components', label: 'Open component catalog', shortcut: '⌘K' },
]
const flowNodes = [
  { detail: '用户提交发布请求', id: 'trigger', label: 'Release requested', status: 'completed' as const, type: 'trigger' as const },
  { detail: '测试是否全部通过', id: 'condition', label: 'Checks passed?', status: 'completed' as const, type: 'condition' as const },
  { detail: '等待用户确认', id: 'approval', label: 'Human approval', status: 'running' as const, type: 'action' as const },
  { detail: '发布 package', id: 'result', label: 'Publish', status: 'waiting' as const, type: 'result' as const },
]

function done(message: string) {
  feedback.value = message
}
</script>

<template>
  <section class="agent-component-demo" :data-demo="component">
    <header>
      <span>LIVE COMPONENT</span>
      <div><b>H5</b><b>WEAPP</b></div>
    </header>
    <nav class="agent-component-demo__tabs" aria-label="Demo views">
      <button type="button" :data-active="String(demoTab === 'preview')" @click="demoTab = 'preview'">
        Preview
      </button>
      <button type="button" :data-active="String(demoTab === 'code')" @click="demoTab = 'code'">
        Code
      </button>
    </nav>

    <div v-show="demoTab === 'preview'" class="agent-component-demo__stage">
      <AgentLoading v-if="component === 'loading'" label="Agent 正在分析组件" variant="grid" />
      <AgentThinking v-else-if="component === 'thinking'" label="Agent 执行轨迹" default-open :steps="reasoningSteps" />
      <AgentMarkdown v-else-if="component === 'markdown'" :content="markdownContent" final />
      <AgentStream v-else-if="component === 'stream'" :content="streamContent" status="streaming" />
      <div v-else-if="component === 'message'" class="agent-component-demo__stack">
        <AgentMessage role="assistant" label="Varo Agent">
          已完成组件审计。
        </AgentMessage><AgentMessage role="user" label="你">
          继续生成 API 文档。
        </AgentMessage>
      </div>
      <AgentConversation v-else-if="component === 'conversation'" :messages="messages" />
      <div v-else-if="component === 'tool-chip'" class="agent-component-demo__row">
        <AgentToolChip v-for="tool in tools" :key="tool.id" :tool="tool" />
      </div>
      <AgentTaskList v-else-if="component === 'task-list'" title="发布计划" :tasks="tasks" />
      <AgentRadioGroup v-else-if="component === 'radio-group'" v-model:value="radioValue" :choices="[{ label: '平衡', value: 'balanced', description: '推荐设置' }, { label: '快速', value: 'fast' }, { label: '严谨', value: 'strict' }]" />
      <AgentApproval v-else-if="component === 'approval'" v-model:value="approvalValue" title="确认发布动作" description="确认后 Agent 才能执行外部副作用。" :choices="choices" @approve="done('已批准')" @reject="done('已拒绝')" />
      <AgentRecommendation v-else-if="component === 'recommendation'" title="推荐统一事件协议" description="业务只提供事件来源，组件负责状态投影。" :confidence="96" @accept="done('已采用建议')" />
      <AgentPromptSuggestions v-else-if="component === 'prompt-suggestions'" :suggestions="['分析双端能力', '生成发布计划', '检查包体']" @select="done($event)" />
      <AgentComposer v-else-if="component === 'composer'" v-model="prompt" :suggestions="['分析需求', '生成计划']" @submit="done(`提交：${$event}`)" />
      <AgentResponseActions v-else-if="component === 'response-actions'" content="双端组件已经通过。" @copy="done('已复制')" @retry="done('重新生成')" @like="done('有帮助')" @dislike="done('需改进')" />
      <AgentArtifact v-else-if="component === 'artifact'" :artifact="artifact" @open="done('打开产物')" />
      <AgentSourceList v-else-if="component === 'sources'" :sources="sources" title="参考来源" @open="done($event.title)" />
      <AgentAttachmentList v-else-if="component === 'attachments'" :attachments="attachments" @remove="done(`移除 ${$event.name}`)" />
      <AgentEventRenderer v-else-if="component === 'event-renderer'" :snapshot="eventSnapshot" @approve="done(`批准 ${$event}`)" @reject="done('拒绝')" @retry="done('重试')" />
      <AgentMessageScroller v-else-if="component === 'message-scroller'" :at-live-edge="false" @follow="done('跳到最新消息')">
        <AgentConversation :messages="messages" />
      </AgentMessageScroller>
      <AgentCodeBlock v-else-if="component === 'code-block'" filename="agent.ts" language="TypeScript" :code="code" :focused-lines="[2, 5]" status="streaming" @copy="done('已复制代码')" />
      <AgentFileDiff v-else-if="component === 'file-diff'" filename="src/runtime/create-agent-stream.ts" :labels="diffLabels" :lines="diffLines" status="running" @accept="done('已接受变更')" @expand="done('展开未修改上下文')" @reject="done('已拒绝变更')" @select="done(`${$event.side}: ${$event.line.content}`)" />
      <AgentToolResult v-else-if="component === 'tool-result'" name="pnpm test" status="completed" duration="1.8s" summary="38 tests passed" :output="toolResultOutput" default-open />
      <AgentImageGeneration v-else-if="component === 'image-generation'" status="generating" :progress="68" prompt="A clean mini-program Agent interface" />
      <AgentToolApproval v-else-if="component === 'tool-approval'" tool="npm.publish" description="允许 Agent 发布 @varo-ui/ai？" :details="[{ label: 'Package', value: '@varo-ui/ai' }, { label: 'Tag', value: 'latest' }]" @allow="done('允许一次')" @deny="done('已拒绝')" />
      <AgentCitations v-else-if="component === 'citations'" title="引用来源" :items="citations" default-open @open="done($event.title)" />
      <AgentActivity v-else-if="component === 'activity'" title="Agent 活动" :items="activity" />
      <AgentSidebar v-else-if="component === 'sidebar'" v-model:active-id="sidebarActive" v-model:collapsed="sidebarCollapsed" :groups="sidebarGroups" @select="done($event.label)" />
      <AgentContextCard v-else-if="component === 'context-card'" title="检索上下文" :chunks="contextChunks" @open="done($event.source ?? '')" />
      <AgentInsightCard v-else-if="component === 'insight-card'" v-model:current="insightCurrent" :insights="insights" @action="done($event.action ?? '')" />
      <AgentSelectionActions v-else-if="component === 'selection-actions'" text="小程序 Agent UI 已通过双端构建。" :actions="[{ id: 'explain', label: '解释' }, { id: 'improve', label: '优化' }, { id: 'shorten', label: '缩短' }]" @select="done($event.action.label)" />
      <AgentDiffTable v-else-if="component === 'diff-table'" title="组件变更" :columns="columns" :rows="records.map((row, index) => ({ ...row, change: index === 0 ? 'add' : index === 1 ? 'update' : 'remove' }))" @accept="done('已接受表格变更')" />
      <AgentRecordsTable v-else-if="component === 'records-table'" :columns="columns" :rows="records" sort-by="name" @sort="done(`排序 ${$event.label}`)" @select="done(String($event.name))" />
      <AgentFilterTable v-else-if="component === 'filter-table'" v-model:filter="tableFilter" :columns="columns" :filters="filters" :rows="records" />
      <AgentCommandSearch v-else-if="component === 'command-search'" v-model="searchQuery" :items="searchItems" @select="done($event.label)" />
      <AgentFlowchart v-else-if="component === 'flowchart'" title="发布工作流" :nodes="flowNodes" @select="done($event.label)" @add="done('添加步骤')" />
      <AgentFineTune v-else-if="component === 'fine-tune'" v-model:controls="fineTuneControls" title="调整 Agent Card" @apply="done('已应用调整')" />
      <AgentChat v-else-if="component === 'agent-chat'" v-model="prompt" title="Varo Agent" :messages="messages" :snapshot="eventSnapshot" :suggestions="['分析需求', '生成计划']" @submit="done($event)" />
    </div>

    <section v-if="demoTab === 'code'" class="agent-component-demo__source">
      <header><span>{{ demoDefinition.name }}</span><b>{{ demoDefinition.importPath }}</b></header>
      <pre><code>{{ demoDefinition.code }}</code></pre>
    </section>

    <output v-if="feedback" aria-live="polite">{{ feedback }}</output>
  </section>
</template>

<style scoped>
.agent-component-demo {
  position: relative;
  display: grid;
  gap: 0;
  margin: 18px 0 28px;
  overflow: hidden;
  color: var(--vp-c-text-1);
  background: var(--varo-demo-surface);
  border: 1px solid var(--varo-demo-border);
  border-radius: 18px;
  box-shadow: var(--varo-demo-shadow);
}

.agent-component-demo::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 2;
  height: 2px;
  content: '';
  background: linear-gradient(90deg, transparent, var(--vp-c-brand-1), transparent);
  opacity: 0.72;
}

.agent-component-demo > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 46px;
  padding: 0 14px;
  background: var(--varo-demo-surface-strong);
  border-bottom: 1px solid var(--varo-demo-border);
}

.agent-component-demo > header > span {
  font-size: 9px;
  font-weight: 900;
  color: var(--vp-c-brand-1);
  letter-spacing: 0.16em;
}

.agent-component-demo > header div {
  display: flex;
  gap: 6px;
}

.agent-component-demo > header b {
  padding: 4px 8px;
  font-size: 8px;
  color: var(--vp-c-brand-1);
  letter-spacing: 0.06em;
  background: var(--vp-c-brand-soft);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent);
  border-radius: 999px;
}

.agent-component-demo__tabs {
  display: flex;
  gap: 4px;
  padding: 9px 14px 0;
  background: var(--varo-demo-surface);
}

.agent-component-demo__tabs button {
  min-height: 34px;
  padding: 0 13px;
  font-size: 11px;
  font-weight: 700;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 999px;
  transition:
    color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.agent-component-demo__tabs button:hover {
  color: var(--vp-c-text-1);
}

.agent-component-demo__tabs button:active {
  transform: scale(0.96);
}

.agent-component-demo__tabs button[data-active='true'] {
  color: var(--vp-c-bg);
  background: var(--vp-c-text-1);
}

.agent-component-demo__stage {
  box-sizing: border-box;
  display: grid;
  align-content: center;
  width: 100%;
  min-height: 330px;
  padding: 28px;
  overflow-x: auto;
  background:
    radial-gradient(circle at 78% 16%, color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent), transparent 32%),
    linear-gradient(var(--varo-gridline) 1px, transparent 1px),
    linear-gradient(90deg, var(--varo-gridline) 1px, transparent 1px), var(--varo-demo-surface);
  background-size:
    auto,
    24px 24px,
    24px 24px,
    auto;
}

.agent-component-demo[data-demo='flowchart'] .agent-component-demo__stage,
.agent-component-demo[data-demo='agent-chat'] .agent-component-demo__stage {
  align-content: start;
  max-height: 680px;
  overflow-y: auto;
}

.agent-component-demo__stage > :deep(*) {
  max-width: 100%;
}

.agent-component-demo__stage > :deep(:first-child) {
  animation: varo-agent-demo-enter 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.agent-component-demo__stage :deep(button) {
  cursor: pointer;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease;
}

.agent-component-demo__stage :deep(button:hover:not(:disabled)) {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 42%, var(--varo-border));
  box-shadow: 0 8px 20px color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
}

.agent-component-demo__stage :deep(button:active:not(:disabled)) {
  transform: scale(0.97);
}

.agent-component-demo__stack {
  display: grid;
  gap: 12px;
}

.agent-component-demo__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.agent-component-demo__source {
  min-height: 330px;
  color: #dbeafe;
  background: #0d1117;
}

.agent-component-demo__source > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 14px;
  background: #111827;
  border-bottom: 1px solid #26334a;
}

.agent-component-demo__source > header span {
  font-size: 11px;
  font-weight: 800;
}

.agent-component-demo__source > header b {
  font-size: 9px;
  font-weight: 600;
  color: #64748b;
}

.agent-component-demo__source pre {
  padding: 22px;
  margin: 0;
  overflow-x: auto;
  background: transparent;
}

.agent-component-demo__source code {
  font-size: 11px;
  line-height: 1.75;
  color: #cbd5e1;
  white-space: pre;
}

.agent-component-demo > output {
  min-height: 36px;
  padding: 9px 14px;
  font-size: 10px;
  font-weight: 750;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-top: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 22%, transparent);
}

@keyframes varo-agent-demo-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

:global(.dark) .agent-component-demo__stage :deep(.bg-white),
:global(.dark) .agent-component-demo__stage :deep(.bg-slate-50),
:global(.dark) .agent-component-demo__stage :deep([class~='bg-slate-50/90']),
:global(.dark) .agent-component-demo__stage :deep(.bg-slate-100) {
  background-color: var(--varo-surface) !important;
}

:global(.dark) .agent-component-demo__stage :deep(.text-slate-950),
:global(.dark) .agent-component-demo__stage :deep(.text-slate-900),
:global(.dark) .agent-component-demo__stage :deep(.text-slate-800),
:global(.dark) .agent-component-demo__stage :deep(.text-slate-700),
:global(.dark) .agent-component-demo__stage :deep(.text-slate-600) {
  color: var(--varo-foreground) !important;
}

:global(.dark) .agent-component-demo__stage :deep(.border-slate-200),
:global(.dark) .agent-component-demo__stage :deep(.border-slate-100) {
  border-color: var(--varo-border) !important;
}

:global(.dark)
  .agent-component-demo__stage
  :deep(
    .agent-message-scroller,
    .agent-file-diff,
    .agent-tool-result,
    .agent-citations,
    .agent-activity,
    .agent-context-card,
    .agent-insight-card,
    .agent-tool-approval,
    .agent-fine-tune,
    .agent-sidebar,
    .agent-table,
    .agent-command-search,
    .agent-flowchart,
    .agent-image-generation
  ) {
  color: var(--varo-foreground);
  background: var(--varo-surface);
  border-color: var(--varo-border);
}

:global(.dark)
  .agent-component-demo__stage
  :deep(
    .agent-file-diff__header,
    .agent-tool-result__header,
    .agent-citations__trigger,
    .agent-sidebar > header,
    .agent-command-search > label,
    .agent-table th,
    .agent-context-card article
  ) {
  color: var(--varo-foreground);
  background: var(--varo-surface-strong);
  border-color: var(--varo-border);
}

:global(.dark) .agent-component-demo__stage :deep(button:not(.agent-code-block button)) {
  color: inherit;
}

@media (max-width: 640px) {
  .agent-component-demo__stage {
    min-height: 280px;
    padding: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-component-demo__stage > :deep(:first-child) {
    animation: none;
  }
}
</style>
