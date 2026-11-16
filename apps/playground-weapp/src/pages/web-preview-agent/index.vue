<script setup lang="ts">
import type { StreamChunk } from '@tanstack/ai'
import type { ChatClientSnapshot } from '@tanstack/ai-client'
import type { AgentDiffLine } from '../../components/agent-ui/file-diff'
import type { AgentContextSource } from '../../components/agent-ui/workspace-types'
import type { MenuName } from '../../components/ui/menu-context'
import { EventType } from '@tanstack/ai/client'
import { ChatClient, stream } from '@tanstack/ai-client'
import { agentMessageText } from '../../components/agent-ui/presentation'
import { computed, onUnload, onUnmounted, shallowRef } from 'wevu'
import AgentComposerScope from '../../components/agent-ui/AgentComposerScope.vue'
import AgentFileDiff from '../../components/agent-ui/AgentFileDiff.vue'
import AgentMarkdown from '../../components/agent-ui/AgentMarkdown.vue'
import AgentStream from '../../components/agent-ui/AgentStream.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VMenuItem from '../../components/ui/v-menu-item.vue'
import VMenu from '../../components/ui/v-menu.vue'

type StreamPhase = 'idle' | 'streaming' | 'stopped' | 'completed'

const localSources = shallowRef<AgentContextSource[]>([
  { id: 'local', label: '本地验证来源', enabled: true, status: 'available' },
])
const sourceToggleCount = shallowRef(0)
const sourceTogglePayload = shallowRef('none')
const sourceDiagnostic = computed(() =>
  `enabled=${localSources.value[0]?.enabled};count=${sourceToggleCount.value};payload=${sourceTogglePayload.value}`,
)
function toggleLocalSource([source, enabled]: [AgentContextSource, boolean]) {
  sourceToggleCount.value += 1
  sourceTogglePayload.value = `${source.id}:${enabled}`
  localSources.value = localSources.value.map(item => item.id === source.id ? { ...item, enabled } : item)
}

const diffLines: AgentDiffLine[] = [
  { id: 'context', type: 'hunk', content: '@@ local context @@', collapsedLines: 3 },
]
const diffDiagnostic = shallowRef('none')
function expandLocalDiff([line, index]: [AgentDiffLine, number]) {
  diffDiagnostic.value = `${line.id}:${index}:${line.collapsedLines}`
}

const menuValue = shallowRef<MenuName>('source-a')
const menuOptions = [
  { text: '来源 A', value: 'source-a' },
  { text: '来源 B', value: 'source-b' },
]
const menuPayload = shallowRef('none')
const menuDiagnostic = computed(() => `value=${menuValue.value};payload=${menuPayload.value}`)
function selectLocalMenu([value, option]: [MenuName, { text: string, value: MenuName }]) {
  menuPayload.value = `${value}:${option.text}`
}

const markdownSample = [
  '# AgentMarkdown 静态样例',
  '',
  '这段内容由现有的 **AgentMarkdown** 原生组件解析。点击 [Varo 预览链接](https://example.com/varo-preview) 会在下方显示真实 link 事件。',
  '',
  '## 覆盖内容',
  '',
  '- Wevu 原生组件树',
  '- 无业务接口的本地数据',
  '- 列表、表格与代码块',
  '',
  '| Surface | Runtime |',
  '| --- | --- |',
  '| Controls | glass-easel |',
  '| Agent | AgentMarkdown |',
  '',
  '```ts',
  'const runtime = \'wevu\'',
  'const framework = \'glass-easel\'',
  '```',
].join('\n')

const streamChunks = [
  '## 流式结论\n\n',
  '当前内容由 ',
  '`TanStack ChatClient` ',
  '消费标准 AG-UI 本地分片。这里不连接模型或网络。\n\n',
  '- “停止”由 SDK 中止生产器并保留已显示内容。\n',
  '- “继续”开启本地后续轮次，追加剩余生产分片。\n',
  '- “从头重播”会重置内容和节奏。\n\n',
  '| 阶段 | 可观察结果 |\n',
  '| --- | --- |\n',
  '| streaming | AgentStream 显示逐步增长的文本 |\n',
  '| completed | AgentStream 切换到现有 Markdown 渲染 |\n\n',
  '```ts\n',
  'client.stop()\n',
  '```\n',
] as const

const markdownLinkCount = shallowRef(0)
const markdownLinkOutput = shallowRef('最近链接：尚未点击')
const markdownErrorOutput = shallowRef('Markdown 状态：ready')
const streamPhase = shallowRef<StreamPhase>('idle')
const producerChunkIndex = shallowRef(0)
const lastStreamAction = shallowRef('等待点击“开始流式内容”')

let cleanedUp = false
const client = new ChatClient({ threadId: 'varo-native-stream-preview', connection: stream(async function* (_messages, _data, signal, input): AsyncGenerator<StreamChunk> {
  const id = `preview-${input.runId}`
  yield { type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId }
  yield { type: EventType.TEXT_MESSAGE_START, messageId: id, role: 'assistant' }
  while (producerChunkIndex.value < streamChunks.length) {
    await new Promise<void>((resolve) => {
      const finish = () => { clearTimeout(timer); signal?.removeEventListener('abort', finish); resolve() }
      const timer = setTimeout(finish, 110)
      signal?.addEventListener('abort', finish, { once: true })
      if (signal?.aborted) { finish() }
    })
    if (signal?.aborted) { return }
    const delta = streamChunks[producerChunkIndex.value]!
    producerChunkIndex.value += 1
    yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId: id, delta }
  }
  yield { type: EventType.TEXT_MESSAGE_END, messageId: id }
  yield { type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId }
}) })
const streamSnapshot = shallowRef<ChatClientSnapshot>(client.getSnapshot())
const streamContent = computed(() => streamSnapshot.value.messages.filter(message => message.role === 'assistant').map(message => agentMessageText(message)).join(''))
const streamFinal = computed(() => streamPhase.value === 'completed')
const unsubscribeStream = client.subscribeSnapshot(() => {
  streamSnapshot.value = client.getSnapshot()
  if (!streamSnapshot.value.isLoading && streamPhase.value === 'streaming' && producerChunkIndex.value === streamChunks.length) {
    streamPhase.value = 'completed'
    lastStreamAction.value = '流式内容播放完成'
  }
})

const agentStreamStatus = computed(() => {
  if (streamPhase.value === 'streaming') {
    return 'streaming' as const
  }
  if (streamPhase.value === 'completed') {
    return 'completed' as const
  }
  return 'idle' as const
})
const startButtonLabel = computed(() => streamPhase.value === 'stopped' ? '继续流式内容' : '开始流式内容')
const startButtonDisabled = computed(() => streamPhase.value === 'streaming')
const stopButtonDisabled = computed(() => streamPhase.value !== 'streaming')
const streamProgressLabel = computed(() => `生产分片：${producerChunkIndex.value} / ${streamChunks.length}`)
const streamBufferLabel = computed(() => `剩余分片：${streamChunks.length - producerChunkIndex.value}`)
const streamFinalLabel = computed(() => `final：${String(streamFinal.value)}`)
const streamDiagnostic = computed(() => `phase=${streamPhase.value};chunks=${producerChunkIndex.value}/${streamChunks.length};pending=${streamChunks.length - producerChunkIndex.value};final=${String(streamFinal.value)};sdk=${streamSnapshot.value.status}`)

function recordMarkdownLink(href: string) {
  markdownLinkCount.value += 1
  markdownLinkOutput.value = `最近链接 #${markdownLinkCount.value}：${href}`
}

function recordMarkdownError(message: string) {
  markdownErrorOutput.value = `Markdown 错误：${message}`
}

function beginStream(action: string) {
  client.stop()
  client.clear()
  producerChunkIndex.value = 0
  streamPhase.value = 'streaming'
  lastStreamAction.value = action
  void client.sendMessage('开始本地流式内容')
}

function startStream() {
  if (cleanedUp || streamPhase.value === 'streaming') { return }
  if (streamPhase.value === 'stopped') {
    streamPhase.value = 'streaming'
    lastStreamAction.value = '继续播放剩余流式内容'
    void client.sendMessage('继续本地流式内容')
    return
  }
  beginStream('开始新的流式内容')
}

function stopStream() {
  if (streamPhase.value !== 'streaming') { return }
  streamPhase.value = 'stopped'
  lastStreamAction.value = '已停止；内容和生产进度已保留'
  client.stop()
}

function replayStream() {
  if (!cleanedUp) { beginStream('从头重播流式内容') }
}

function cleanup() {
  if (cleanedUp) { return }
  cleanedUp = true
  client.stop()
  unsubscribeStream()
  client.detach()
  client.dispose()
}

onUnload(cleanup)
onUnmounted(cleanup)
</script>

<template>
  <view class="box-border min-h-screen bg-[var(--varo-ui-bg)] px-3 py-4 text-[var(--varo-ui-text)]">
    <view class="mb-3 grid gap-1 rounded-2xl bg-slate-950 p-4 text-white">
      <text class="text-lg font-black">
        Wevu 原生 Agent 预览
      </text>
      <text class="text-xs leading-5 text-slate-300">
        使用现有 AgentMarkdown、AgentStream 与 TanStack ChatClient；这不是微信客户端模拟器，也不调用登录、支付或业务 API。
      </text>
    </view>

    <VCard class-name="mb-3" variant="outline">
      <template #title>
        AgentMarkdown 静态内容
      </template>
      <template #description>
        标题、链接、列表、表格和代码块均由当前原生渲染器处理。
      </template>

      <view class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
        <AgentMarkdown
          :content="markdownSample"
          final
          @error="recordMarkdownError"
          @link="recordMarkdownLink"
        />
        <view class="grid gap-1 rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs">
          <text data-preview-field="markdown-link-output">
            {{ markdownLinkOutput }}
          </text>
          <text data-preview-field="markdown-link-count">
            link 事件计数：{{ markdownLinkCount }}
          </text>
          <text data-preview-field="markdown-status">
            {{ markdownErrorOutput }}
          </text>
        </view>
      </view>
    </VCard>

    <VCard variant="outline">
      <template #title>
        AgentStream 真实节奏
      </template>
      <template #description>
        本地生产器通过标准 AG-UI 分片更新 SDK 快照；完成后沿用 AgentStream 当前的 Markdown 切换行为。
      </template>

      <view class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
        <view class="min-h-40 rounded-xl border border-[var(--varo-ui-border)] bg-[var(--varo-ui-fill)] p-3">
          <AgentStream
            :content="streamContent"
            :final="streamFinal"
            :status="agentStreamStatus"
          />
        </view>

        <view
          class="grid gap-1 rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs"
          data-preview-field="stream-state"
          :data-preview-value="streamDiagnostic"
        >
          <text data-preview-field="stream-phase">
            流式状态：{{ streamPhase }}
          </text>
          <text data-preview-field="stream-progress">
            {{ streamProgressLabel }}
          </text>
          <text data-preview-field="stream-buffer">
            {{ streamBufferLabel }}
          </text>
          <text data-preview-field="stream-final">
            {{ streamFinalLabel }}
          </text>
          <text data-preview-field="stream-last-action">
            最近操作：{{ lastStreamAction }}
          </text>
        </view>

        <view class="grid grid-cols-3 gap-2">
          <VButton size="sm" :disabled="startButtonDisabled" @click="startStream">
            {{ startButtonLabel }}
          </VButton>
          <VButton size="sm" :disabled="stopButtonDisabled" tone="default" variant="outline" @click="stopStream">
            停止
          </VButton>
          <VButton size="sm" tone="default" variant="outline" @click="replayStream">
            从头重播
          </VButton>
        </view>
      </view>
    </VCard>

    <VCard class-name="mt-3" variant="outline">
      <template #title>
        原生多值事件
      </template>
      <template #description>
        Wevu 使用单个 tuple 载荷；这里运行实际 ComposerScope、FileDiff 和 Menu 组件，不调用外部服务。
      </template>
      <view class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
        <text data-preview-field="source-toggle-state" :data-preview-value="sourceDiagnostic">
          {{ sourceDiagnostic }}
        </text>
        <AgentComposerScope
          class="preview-source-scope block"
          :sources="localSources"
          title="来源事件验证"
          @toggle="toggleLocalSource"
        />
        <AgentFileDiff
          class="preview-file-diff"
          filename="local-context.ts"
          :lines="diffLines"
          :show-actions="false"
          :show-toolbar="false"
          @expand="expandLocalDiff"
        />
        <text data-preview-field="diff-expand-state" :data-preview-value="diffDiagnostic">
          {{ diffDiagnostic }}
        </text>
        <VMenu class="preview-menu">
          <VMenuItem v-model="menuValue" name="source" title="选择来源" :options="menuOptions" @select="selectLocalMenu" />
        </VMenu>
        <text data-preview-field="menu-select-state" :data-preview-value="menuDiagnostic">
          {{ menuDiagnostic }}
        </text>
      </view>
    </VCard>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Wevu Agent 预览",
  "usingComponents": {}
}
</json>
