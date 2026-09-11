<script setup lang="ts">
import type { VaroRobotChatOptions } from '../../components/ui/robot-chat.types'
import { computed, shallowRef } from 'wevu'
import VRobotChat from '../../components/ui/v-robot-chat.vue'

const options: VaroRobotChatOptions = {
  appid: 'preview-robot',
  history: true,
  operateCardHeight: 72,
  welcome: '你好，请问需要什么帮助？',
}

const status = shallowRef('正在连接机器人…')
const lastQuery = shallowRef('尚未发送')
const queryCount = shallowRef(0)
const diagnostic = computed(() =>
  `status=${status.value};query=${lastQuery.value};count=${queryCount.value}`,
)

function ready() {
  status.value = '机器人已连接'
}

function failed() {
  status.value = '机器人连接失败'
}

function queryCallback(event: unknown) {
  const record = event && typeof event === 'object' ? event as Record<string, unknown> : undefined
  const nested = record?.detail && typeof record.detail === 'object' ? record.detail as Record<string, unknown> : undefined
  const query = [record?.query, nested?.query, nested?.detail].find(value => typeof value === 'string' && value.trim())
  lastQuery.value = typeof query === 'string' ? query.trim() : '已收到查询回调'
  queryCount.value += 1
  status.value = `已收到查询回调 #${queryCount.value}`
}

function backHome() {
  status.value = '已退出机器人会话'
}
</script>

<template>
  <view class="box-border min-h-screen bg-[var(--varo-ui-bg)] px-3 py-4 text-[var(--varo-ui-text)]">
    <view class="mb-3 grid gap-1 rounded-2xl bg-slate-950 p-4 text-white">
      <text class="text-lg font-black">
        Wevu 机器人对话预览
      </text>
      <text class="text-xs leading-5 text-slate-300">
        VRobotChat 只在 weapp 目标存在。浏览器预览画出 chatbotwidget 会话面和 operateCard，不是微信对话开放平台。
      </text>
    </view>

    <VRobotChat
      :options="options"
      @ready="ready"
      @error="failed"
      @query-callback="queryCallback"
      @back-home="backHome"
    />

    <view
      class="mt-3 grid gap-1 rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs"
      data-preview-field="robot-state"
      :data-preview-value="diagnostic"
    >
      <text data-preview-field="robot-status">
        {{ status }}
      </text>
      <text data-preview-field="robot-last-query">
        最近查询：{{ lastQuery }}
      </text>
      <text data-preview-field="robot-query-count">
        queryCallback：{{ queryCount }}
      </text>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Wevu 机器人预览",
  "usingComponents": {}
}
</json>
