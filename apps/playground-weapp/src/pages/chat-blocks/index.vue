<script setup lang="ts">
import AgentAssistantSheet from '../../components/blocks/agent-assistant-sheet.vue'
import AgentChat from '../../components/blocks/agent-chat.vue'
import VButton from '../../components/ui/v-button.vue'
import VInput from '../../components/ui/v-input.vue'
import { useChatBlocksDemo } from './useChatBlocksDemo'

const { activeHistoryId, busy, chatVisible, close, closeChat, context, diagnostic, disabled, disabledLabel, draft, expanded, fail, history, insert, layout, messages, newConversation, open, prompt, quote, removeContext, retry, selectedResponse, selectHistory, send, snapshot, stop } = useChatBlocksDemo()

function toggleLayout() {
  layout.value = layout.value === 'panel' ? 'page' : 'panel'
}
</script>

<template>
  <view class="box-border grid min-h-screen min-w-0 gap-4 bg-[var(--varo-ui-bg)] p-4 pb-[calc(env(safe-area-inset-bottom)+80px)] text-[var(--varo-ui-text)]" aria-label="Chat Blocks 演示">
    <view class="grid gap-2">
      <text class="text-xl font-semibold">
        对话与上下文助手
      </text>
      <text class="text-sm">
        本地确定性流演示。停止会取消控制器；插入只修改草稿，不调用外部服务。
      </text>
    </view>
    <view class="flex flex-wrap gap-2">
      <VButton variant="outline" @click="toggleLayout">
        切换页面布局
      </VButton>
      <VButton variant="outline" @click="disabled = !disabled">
        {{ disabledLabel }}
      </VButton>
      <VButton variant="outline" :disabled="disabled" @click="fail">
        演示错误
      </VButton>
      <VButton variant="outline" :disabled="disabled" @click="quote(false)">
        引用此段
      </VButton>
      <VButton variant="outline" :disabled="disabled" @click="quote(true)">
        引用长段落
      </VButton>
    </view>
    <text>把复杂任务拆成可以确认的小步骤，保留用户的决定权。</text>
    <VInput v-model:value="draft" type="textarea" label="草稿" aria-label="草稿" :rows="4" />
    <text class="break-words text-xs" data-chat-demo="state">
      {{ diagnostic }}
    </text>
    <text class="whitespace-pre-wrap break-words" data-chat-demo="draft">
      {{ draft }}
    </text>
    <AgentChat v-if="chatVisible && !open" v-model="prompt" title="本地写作会话" :layout="layout" :busy="busy" :disabled="disabled" :history="history" :active-history-id="activeHistoryId" :messages="messages" :snapshot="snapshot" :suggestions="['写一段建议']" @submit="send" @stop="stop" @close="closeChat" @historySelect="selectHistory" @newConversation="newConversation" @retry="retry" />
    <VButton v-if="!chatVisible && !open" variant="outline" @click="chatVisible = true">
      打开会话
    </VButton>
    <AgentAssistantSheet v-model="prompt" v-model:open="open" v-model:expanded="expanded" :busy="busy" :disabled="disabled" :context="context" :history="history" :active-history-id="activeHistoryId" :messages="messages" :snapshot="snapshot" :selected-response="selectedResponse" :suggestions="['写一段建议']" @submit="send" @stop="stop" @close="close" @historySelect="selectHistory" @newConversation="newConversation" @removeContext="removeContext" @insert="insert" @retry="retry" />
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "对话与上下文助手",
  "usingComponents": {}
}
</json>
