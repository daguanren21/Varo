<script setup lang="ts">
import type { TextStreamSnapshot } from '@varo-ui/ai'
import { createTextStream } from '@varo-ui/ai'
import { computed, onUnload, onUnmounted, shallowRef } from 'wevu'
import AgentMarkdown from '../../components/agent-ui/AgentMarkdown.vue'
import AgentStream from '../../components/agent-ui/AgentStream.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'

type StreamPhase = 'idle' | 'streaming' | 'stopped' | 'completed'

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
  '`@varo-ui/ai` ',
  '的真实 text stream controller 分段提交。\n\n',
  '- “停止”会暂停控制器并保留已显示内容。\n',
  '- “继续”从剩余生产分片恢复。\n',
  '- “从头重播”会重置内容和节奏。\n\n',
  '| 阶段 | 可观察结果 |\n',
  '| --- | --- |\n',
  '| streaming | AgentStream 显示逐步增长的文本 |\n',
  '| completed | AgentStream 切换到现有 Markdown 渲染 |\n\n',
  '```ts\n',
  'controller.finish()\n',
  '```\n',
] as const

const markdownLinkCount = shallowRef(0)
const markdownLinkOutput = shallowRef('最近链接：尚未点击')
const markdownErrorOutput = shallowRef('Markdown 状态：ready')
const streamPhase = shallowRef<StreamPhase>('idle')
const producerChunkIndex = shallowRef(0)
const lastStreamAction = shallowRef('等待点击“开始流式内容”')

const textStream = createTextStream({
  maxCharsPerCommit: 5,
  maxCharsPerSecond: 120,
  maxCommitFps: 20,
  minCharsPerSecond: 24,
  startDelayMs: 80,
  targetLatencyMs: 1200,
})
const streamSnapshot = shallowRef<TextStreamSnapshot>(textStream.getSnapshot())
let producerTimer: ReturnType<typeof setTimeout> | undefined
let cleanedUp = false

const unsubscribeStream = textStream.subscribe(() => {
  const snapshot = textStream.getSnapshot()
  streamSnapshot.value = snapshot
  if (snapshot.final && streamPhase.value === 'streaming') {
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
const streamBufferLabel = computed(() => `待显示字符：${streamSnapshot.value.pendingChars}`)
const streamFinalLabel = computed(() => `final：${String(streamSnapshot.value.final)}`)
const streamDiagnostic = computed(() => `phase=${streamPhase.value};chunks=${producerChunkIndex.value}/${streamChunks.length};pending=${streamSnapshot.value.pendingChars};final=${String(streamSnapshot.value.final)}`)

function recordMarkdownLink(href: string) {
  markdownLinkCount.value += 1
  markdownLinkOutput.value = `最近链接 #${markdownLinkCount.value}：${href}`
}

function recordMarkdownError(message: string) {
  markdownErrorOutput.value = `Markdown 错误：${message}`
}

function clearProducerTimer() {
  clearTimeout(producerTimer)
  producerTimer = undefined
}

function produceNextChunk() {
  producerTimer = undefined
  if (streamPhase.value !== 'streaming') {
    return
  }

  const chunk = streamChunks[producerChunkIndex.value]
  if (chunk === undefined) {
    textStream.finish()
    return
  }

  textStream.enqueue(chunk)
  producerChunkIndex.value += 1
  if (producerChunkIndex.value >= streamChunks.length) {
    textStream.finish()
  }
  else if (streamPhase.value === 'streaming') {
    producerTimer = setTimeout(produceNextChunk, 110)
  }
}

function beginStream(action: string) {
  clearProducerTimer()
  textStream.reset()
  producerChunkIndex.value = 0
  streamPhase.value = 'streaming'
  lastStreamAction.value = action
  produceNextChunk()
}

function startStream() {
  if (streamPhase.value === 'streaming') {
    return
  }
  if (streamPhase.value === 'stopped') {
    streamPhase.value = 'streaming'
    lastStreamAction.value = '继续播放剩余流式内容'
    textStream.resume()
    produceNextChunk()
    return
  }
  beginStream('开始新的流式内容')
}

function stopStream() {
  if (streamPhase.value !== 'streaming') {
    return
  }
  streamPhase.value = 'stopped'
  lastStreamAction.value = '已停止；内容和生产进度已保留'
  clearProducerTimer()
  textStream.pause()
}

function replayStream() {
  beginStream('从头重播流式内容')
}

function cleanup() {
  if (cleanedUp) {
    return
  }
  cleanedUp = true
  clearProducerTimer()
  unsubscribeStream()
  textStream.destroy()
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
        使用现有 AgentMarkdown、AgentStream 与 @varo-ui/ai；这不是微信客户端模拟器，也不调用登录、支付或业务 API。
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
        本地生产器分片送入 text stream controller；完成后沿用 AgentStream 当前的 Markdown 切换行为。
      </template>

      <view class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
        <view class="min-h-40 rounded-xl border border-[var(--varo-ui-border)] bg-[var(--varo-ui-fill)] p-3">
          <AgentStream
            :content="streamSnapshot.visible"
            :final="streamSnapshot.final"
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
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Wevu Agent 预览",
  "usingComponents": {}
}
</json>
