<script setup lang="ts">
import type { VaroRobotChatOptions } from '../../components/ui/robot-chat.types'
import { computed, shallowRef } from 'wevu'
import DocsDemoPage from '../../components/DocsDemoPage.vue'
import VRobotChat from '../../components/ui/v-robot-chat.vue'
import { useDocsDemo } from '../../lib/docs-demo'

const { component, en, theme } = useDocsDemo('robot-chat')
const copy = computed(() => en.value
  ? {
      robotHeading: 'Conversation',
      robotLabel: 'Robot conversation',
      welcome: 'Hello, how can I help?',
      robotLoading: 'Connecting to robot…',
      robotReady: 'Robot connected',
      robotError: 'Robot connection failed',
      robotRetry: 'Reconnect',
      robotNoQuery: 'No query yet',
      robotQueryReceived: 'Query callback received',
      robotClosed: 'Left the robot conversation',
      robotLastQuery: 'Last query',
    }
  : {
      robotHeading: '机器人会话',
      robotLabel: '机器人对话',
      welcome: '你好，请问需要什么帮助？',
      robotLoading: '正在连接机器人…',
      robotReady: '机器人已连接',
      robotError: '机器人连接失败',
      robotRetry: '重新连接',
      robotNoQuery: '尚未发送',
      robotQueryReceived: '已收到查询回调',
      robotClosed: '已退出机器人会话',
      robotLastQuery: '最近查询',
    })

const robotOptions = computed<VaroRobotChatOptions>(() => ({
  appid: 'preview-robot',
  history: true,
  operateCardHeight: 72,
  welcome: copy.value.welcome,
}))
const robotState = shallowRef<'loading' | 'ready' | 'error' | 'query' | 'closed'>('loading')
const lastQuery = shallowRef('')
const queryCount = shallowRef(0)
const robotStatus = computed(() => {
  if (robotState.value === 'ready') { return copy.value.robotReady }
  if (robotState.value === 'error') { return copy.value.robotError }
  if (robotState.value === 'closed') { return copy.value.robotClosed }
  if (robotState.value === 'query') { return `${copy.value.robotQueryReceived} #${queryCount.value}` }
  return copy.value.robotLoading
})
const lastQueryLabel = computed(() => lastQuery.value
  || (queryCount.value ? copy.value.robotQueryReceived : copy.value.robotNoQuery))

function robotReady() {
  robotState.value = 'ready'
}

function robotFailed() {
  robotState.value = 'error'
}

function queryCallback(event: unknown) {
  const record = event && typeof event === 'object' ? event as Record<string, unknown> : undefined
  const nested = record?.detail && typeof record.detail === 'object' ? record.detail as Record<string, unknown> : undefined
  const query = [record?.query, nested?.query, nested?.detail].find(value => typeof value === 'string' && value.trim())
  lastQuery.value = typeof query === 'string' ? query.trim() : ''
  queryCount.value += 1
  robotState.value = 'query'
}

function backHome() {
  robotState.value = 'closed'
}
</script>

<template>
  <DocsDemoPage :component="component" :theme="theme">
    <view class="docs-demo__section docs-demo__stack" data-docs-case="conversation">
      <text class="docs-demo__heading">
        {{ copy.robotHeading }}
      </text>
      <VRobotChat
        :aria-label="copy.robotLabel"
        :options="robotOptions"
        :loading-text="copy.robotLoading"
        :error-text="copy.robotError"
        :retry-text="copy.robotRetry"
        @ready="robotReady"
        @error="robotFailed"
        @query-callback="queryCallback"
        @back-home="backHome"
      />
      <view class="grid gap-1" aria-live="polite">
        <text class="docs-demo__value" data-docs-state="robot-status">
          {{ robotStatus }}
        </text>
        <text class="docs-demo__muted" data-docs-state="robot-last-query">
          {{ copy.robotLastQuery }}：{{ lastQueryLabel }}
        </text>
        <text class="docs-demo__muted" data-docs-state="robot-query-count">
          queryCallback：{{ queryCount }}
        </text>
      </view>
    </view>
  </DocsDemoPage>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Robot chat demos",
  "usingComponents": {}
}
</json>
