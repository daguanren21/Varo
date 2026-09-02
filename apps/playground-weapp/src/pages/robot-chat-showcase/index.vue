<script setup lang="ts">
import type { VaroRobotChatOptions } from '../../components/ui/robot-chat.types'
import { computed, shallowRef } from 'wevu'
import VButton from '../../components/ui/v-button.vue'
import VInput from '../../components/ui/v-input.vue'
import VRobotChat from '../../components/ui/v-robot-chat.vue'

const robotAppId = shallowRef('')
const options = shallowRef<VaroRobotChatOptions | null>(null)
const status = shallowRef('输入已在微信对话开放平台创建的机器人 AppID。')
const validationMessage = shallowRef('')
const canConnect = computed(() => robotAppId.value.trim().length > 0)

function connect() {
  const appid = robotAppId.value.trim()
  if (!appid) {
    validationMessage.value = '请输入机器人 AppID'
    return
  }

  validationMessage.value = ''
  status.value = '正在初始化机器人…'
  options.value = {
    appid,
    history: true,
    operateCardHeight: 72,
    welcome: '你好，请问需要什么帮助？',
  }
}

function ready() {
  status.value = '机器人已连接'
}

function failed() {
  status.value = '机器人连接失败，请检查插件权限和机器人 AppID。'
}

function backHome() {
  options.value = null
  status.value = '已退出机器人会话'
}

function queryCallback() {
  status.value = '已收到机器人查询回调'
}
</script>

<template>
  <view class="box-border min-h-screen bg-[var(--varo-ui-bg)] p-3 pb-10 text-[var(--varo-ui-text)]">
    <view class="mb-3 grid gap-1 rounded-2xl bg-slate-950 p-4 text-white">
      <text class="text-lg font-black">
        Varo Robot Chat
      </text>
      <text class="text-xs text-slate-300">
        微信对话开放平台插件与可编辑 operateCard 抽象节点。
      </text>
    </view>

    <view v-if="!options" class="grid gap-3 rounded-2xl bg-[var(--varo-ui-surface)] p-4 shadow-sm">
      <VInput
        :value="robotAppId"
        label="机器人 AppID"
        placeholder="请输入平台分配的机器人 AppID"
        :error-message="validationMessage"
        @update:value="robotAppId = $event"
      />
      <VButton block :disabled="!canConnect" @click="connect">
        开始对话
      </VButton>
      <text class="text-xs leading-5 text-[var(--varo-ui-text-regular)]">
        当前小程序 AppID 必须已获准使用 chatbotwidget 插件。
      </text>
    </view>

    <VRobotChat
      v-else
      :options="options"
      @ready="ready"
      @error="failed"
      @back-home="backHome"
      @query-callback="queryCallback"
    />

    <text class="mt-3 block text-xs text-[var(--varo-ui-text-regular)]" role="status">
      {{ status }}
    </text>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "机器人对话",
  "usingComponents": {}
}
</json>
